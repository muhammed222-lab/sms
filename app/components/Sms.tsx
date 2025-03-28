/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { FaSave, FaClipboard, FaSearch, FaTimes } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import SuccessNotification from "./sms_components/SuccessNotification";
import ActiveOrder from "./sms_components/ActiveOrder";
import OrderHistory from "./sms_components/OrderHistory";
import OtpHelp from "./OtpHelp";
import OrderEmpty from "./OrderEmpty";

interface User {
  email: string | null;
  displayName: string | null;
}

interface SelectOption {
  label: string;
  value: string;
  price?: number;
  stock?: number | string;
  count?: number | string;
  logoUrl?: string;
  flagUrl?: string;
  code?: string;
}

export interface SmsOrder {
  id: number;
  orderId: string;
  phone: string;
  operator: string;
  product: string;
  price: string;
  status: string;
  expires: string;
  sms: string | null;
  created_at: string;
  country: string;
  number: string;
  user_email: string;
  service: string;
  is_reused?: boolean;
}

const Sms = () => {
  const [servicesLoading, setServicesLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [initialServices, setInitialServices] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  );
  const [selectedService, setSelectedService] = useState<any>(null);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isFetchingCode, setIsFetchingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0); // balance in NGN
  const [orders, setOrders] = useState<SmsOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active");
  const [search, setSearch] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [servicePage, setServicePage] = useState(1);
  const [ngnToUsdRate, setNgnToUsdRate] = useState<number | null>(null);
  const pageSize = 20;

  const getServiceLogoUrl = (serviceName: string) => {
    return `https://logo.clearbit.com/${serviceName}.com`;
  };

  // Fetch live NGN-to-USD conversion rate (e.g., if 1 NGN = 0.0026 USD)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/NGN");
        if (!res.ok) {
          console.error("Failed to fetch NGN exchange rate");
          return;
        }
        const data = await res.json();
        // data.rates.USD is the amount in USD for 1 NGN
        setNgnToUsdRate(data.rates.USD);
      } catch (error) {
        console.error("Exchange rate error:", error);
      }
    };
    fetchExchangeRate();
  }, []);

  const fetchCountries = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch("/api/proxy-sms?action=get-countries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch countries");
      }

      const data = await res.json();
      const options = data.map((country: any) => ({
        label: country.text_en,
        value: country.name.toLowerCase(),
        code: country.iso,
        flagUrl: `https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`,
      }));

      setCountries(options);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setMessage({
        type: "error",
        content: "Error loading countries from API.",
      });
    }
  };

  const fetchServices = async (country?: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      let url = "/api/proxy-sms?action=get-prices";
      if (country) url += `&country=${country}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }

      const data = await res.json();
      const services: any[] = [];
      for (const [countryName, products] of Object.entries(data)) {
        for (const [productName, operators] of Object.entries(
          products as any
        )) {
          const operatorData = Object.values(operators as any)[0] as any;
          services.push({
            label: productName,
            value: productName.toLowerCase(),
            price: operatorData.cost_usd, // base price in USD from operator data
            stock: operatorData.count,
            country: countryName.toLowerCase(),
          });
        }
      }

      setInitialServices(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      setMessage({
        type: "error",
        content: "Error loading services from API.",
      });
    }
  };

  const loadServiceOptions = async (inputValue: string) => {
    setServicesLoading(true);
    try {
      if (!selectedCountry) return [];

      if (inputValue && inputValue.length >= 2) {
        const filtered = initialServices.filter((service) =>
          service.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        return filtered;
      } else {
        const endIndex = servicePage * pageSize;
        return initialServices.slice(0, endIndex);
      }
    } catch (error) {
      console.error("Error loading services:", error);
      return [];
    } finally {
      setServicesLoading(false);
    }
  };

  const handleRequestNumber = async () => {
    if (!selectedCountry || !selectedService || !user?.email) {
      setMessage({
        type: "error",
        content: "Please select a country and service.",
      });
      return;
    }

    // Ensure we have the conversion rate for NGN-USD
    if (ngnToUsdRate === null) {
      setMessage({
        type: "error",
        content: "Exchange rate not available. Please try again later.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      // Use operator if provided; else default to "any"
      const operator = selectedService.operator
        ? selectedService.operator
        : "any";

      const token = await currentUser.getIdToken();
      const res = await fetch(
        `/api/proxy-sms?action=buy-activation&country=${selectedCountry.value}&operator=${operator}&product=${selectedService.value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to purchase number");
      }

      const data = await res.json();

      // Calculate cost: Convert price (in RUB) to USD using fixed rate (0.012),
      // then add 50% markup.
      const baseCostUsd = Number(data.price) * 0.012;
      const costUsdMarkup = baseCostUsd * 1.5;
      // Convert cost in USD to NGN: NGN = USD cost / (NGN-to-USD rate)
      const costNgN = costUsdMarkup / ngnToUsdRate;

      // Check available balance (balance is in NGN)
      if (balance < costNgN) {
        throw new Error("Insufficient balance to buy the number.");
      }

      // Create new order in Firebase
      const orderData = {
        id: Number(data.id),
        orderId: data.id.toString(),
        phone: data.phone,
        operator: data.operator || operator,
        product: selectedService.value,
        price: costUsdMarkup.toFixed(2), // Price in USD with 50% added
        status: data.status || "PENDING",
        expires: data.expires,
        sms: null,
        created_at: new Date().toISOString(),
        country: data.country || selectedCountry.value,
        number: data.phone,
        user_email: user.email,
        service: selectedService.value,
      };

      await addDoc(collection(db, "sms_orders"), orderData);
      setOrders((prev) => [...prev, orderData]);

      // Deduct the cost (converted to NGN) from the user balance
      const userBalanceQuery = query(
        collection(db, "userDeposits"),
        where("email", "==", user.email)
      );
      const userBalanceSnapshot = await getDocs(userBalanceQuery);

      if (!userBalanceSnapshot.empty) {
        const userDoc = userBalanceSnapshot.docs[0];
        const currentBalance = userDoc.data().amount || 0;
        const newBalance = currentBalance - costNgN;
        await updateDoc(userDoc.ref, { amount: newBalance });
        setBalance(newBalance);
      }

      setMessage({
        type: "success",
        content: "Number purchased successfully!",
      });
    } catch (error: any) {
      console.error("Error requesting number:", error);
      setMessage({
        type: "error",
        content: error.message.includes("401")
          ? "Authentication failed. Please check your credentials."
          : error.message || "Failed to request number. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSmsCode = async (orderId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      setIsFetchingCode(true);
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `/api/proxy-sms?action=check-order&order_id=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check order");
      }

      const data = await response.json();

      if (data.sms && data.sms.length > 0) {
        const sms = data.sms[0];

        const orderQuery = query(
          collection(db, "sms_orders"),
          where("orderId", "==", orderId),
          where("user_email", "==", currentUser.email)
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, {
            sms: sms.code,
            status: "RECEIVED",
          });
        }

        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === orderId
              ? { ...order, sms: sms.code, status: "RECEIVED" }
              : order
          )
        );

        setMessage({ type: "success", content: "SMS code received." });
      } else if (data.error_code === "wait_sms") {
        setMessage({
          type: "info",
          content: "Waiting for SMS. Code will show here once received.",
        });
      } else {
        throw new Error(data.error || "Failed to fetch SMS.");
      }
    } catch (error: any) {
      console.error("Error fetching SMS code:", error);
      setMessage({
        type: "error",
        content: error.message || "Error fetching SMS code.",
      });
    } finally {
      setIsFetchingCode(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const token = await currentUser.getIdToken();
      const response = await fetch(
        `/api/proxy-sms?action=cancel-order&order_id=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      const data = await response.json();

      const orderQuery = query(
        collection(db, "sms_orders"),
        where("orderId", "==", orderId),
        where("user_email", "==", currentUser.email)
      );
      const orderSnapshot = await getDocs(orderQuery);

      if (!orderSnapshot.empty) {
        const orderDoc = orderSnapshot.docs[0];
        await updateDoc(orderDoc.ref, {
          status: "CANCELLED",
        });

        // Refund 50% (of the USD price converted to NGN)
        const priceUsd = parseFloat(orderDoc.data().price);
        const refundUsd = priceUsd * 0.5;
        const refundNgN = refundUsd / ngnToUsdRate!;

        const userBalanceQuery = query(
          collection(db, "userDeposits"),
          where("email", "==", currentUser.email)
        );
        const userBalanceSnapshot = await getDocs(userBalanceQuery);

        if (!userBalanceSnapshot.empty) {
          const userDoc = userBalanceSnapshot.docs[0];
          const currentBalance = userDoc.data().amount || 0;
          const newBalance = currentBalance + refundNgN;
          await updateDoc(userDoc.ref, { amount: newBalance });
          setBalance(newBalance);
        }
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId ? { ...order, status: "CANCELLED" } : order
        )
      );

      setMessage({
        type: "success",
        content: "Order cancelled successfully with 50% refund.",
      });
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      setMessage({
        type: "error",
        content: error.message || "Failed to cancel order. Please try again.",
      });
    }
  };

  const rebuyNumber = async (order: SmsOrder) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const token = await currentUser.getIdToken();
      const response = await fetch(
        `/api/proxy-sms?action=reuse-number&product=${order.product}&number=${order.number}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to rebuy number");
      }

      const data = await response.json();

      if (data.id) {
        const baseCostUsd = Number(data.price) * 0.012;
        const costUsdMarkup = baseCostUsd * 1.5;
        const costNgN = costUsdMarkup / ngnToUsdRate!;

        const newOrder = {
          id: Number(data.id),
          orderId: data.id.toString(),
          phone: data.phone,
          operator: data.operator || order.operator,
          product: order.product,
          price: costUsdMarkup.toFixed(2),
          status: data.status || "PENDING",
          expires: data.expires,
          sms: null,
          created_at: new Date().toISOString(),
          country: data.country || order.country,
          number: data.phone,
          user_email: currentUser.email || "",
          service: order.service,
          is_reused: true,
        };

        await addDoc(collection(db, "sms_orders"), newOrder);
        setOrders((prev) => [...prev, newOrder]);

        const userBalanceQuery = query(
          collection(db, "userDeposits"),
          where("email", "==", currentUser.email)
        );
        const userBalanceSnapshot = await getDocs(userBalanceQuery);

        if (!userBalanceSnapshot.empty) {
          const userDoc = userBalanceSnapshot.docs[0];
          const currentBalance = userDoc.data().amount || 0;
          const newBalance = currentBalance - costNgN;
          await updateDoc(userDoc.ref, { amount: newBalance });
          setBalance(newBalance);
        }

        setMessage({
          type: "success",
          content: "Number successfully re-bought.",
        });
      } else {
        throw new Error(data.error || "Failed to rebuy number");
      }
    } catch (error: any) {
      console.error("Error re-buying number:", error);
      setMessage({
        type: "error",
        content:
          error.message || "Failed to rebuy the number. Please try again.",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email,
          displayName: currentUser.displayName,
        });

        try {
          const q = query(
            collection(db, "userDeposits"),
            where("email", "==", currentUser.email)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setBalance(userData.amount || 0);
          }

          const ordersQuery = query(
            collection(db, "sms_orders"),
            where("user_email", "==", currentUser.email)
          );
          const ordersSnapshot = await getDocs(ordersQuery);
          const ordersList = ordersSnapshot.docs.map(
            (doc) => doc.data() as SmsOrder
          );
          setOrders(ordersList);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
    });

    fetchCountries();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchServices(selectedCountry.value);
    }
  }, [selectedCountry]);

  const getCountdown = (expires: string) => {
    const diff = new Date(expires).getTime() - Date.now();
    if (diff <= 0) return "00:00";
    const minutes = Math.floor(diff / 60000)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = orders.filter(
    (order) =>
      new Date(order.expires).getTime() > Date.now() &&
      ["PENDING", "RECEIVED"].includes(order.status)
  );

  const historyOrders = orders.filter(
    (order) =>
      new Date(order.expires).getTime() <= Date.now() ||
      !["PENDING", "RECEIVED"].includes(order.status)
  );

  const handleSave = () => {
    if (selectedService) {
      localStorage.setItem("savedService", JSON.stringify(selectedService));
      setSuccessMessage("Service saved successfully.");
      setShowSuccess(true);
    }
  };

  const renderServiceSelect = () => (
    <AsyncSelect
      inputId="service-select"
      isDisabled={!selectedCountry}
      noOptionsMessage={() =>
        !selectedCountry ? "Please select a country first" : "No options found"
      }
      cacheOptions
      defaultOptions={initialServices.slice(0, pageSize)}
      loadOptions={loadServiceOptions}
      onChange={setSelectedService}
      placeholder="Search by service..."
      isLoading={servicesLoading}
      onMenuScrollToBottom={() => setServicePage((prev) => prev + 1)}
      formatOptionLabel={(option: any) => (
        <div className="flex items-center gap-2">
          <img
            src={getServiceLogoUrl(option.label.toLowerCase())}
            alt=""
            className="w-5 h-5"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = "/default-logo.png";
            }}
          />
          {option.label}
        </div>
      )}
    />
  );

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white border rounded-lg relative">
      {showSuccess && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <h2 className="text-xl font-bold mb-4">New SMS</h2>

      {message.content && (
        <div
          className={`p-2 mb-4 rounded text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-600"
              : message.type === "success"
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {message.content}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a country
        </label>
        <Select
          inputId="country-select"
          options={countries}
          value={selectedCountry}
          onChange={(option) => {
            setSelectedCountry(option);
            setSelectedService(null);
          }}
          placeholder="Search by country..."
          formatOptionLabel={(option: any) => (
            <div className="flex items-center gap-2">
              <img
                src={option.flagUrl}
                alt=""
                className="w-5 h-5"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = "/default-flag.png";
                }}
              />
              {option.label}
            </div>
          )}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a service
        </label>
        {selectedCountry ? (
          renderServiceSelect()
        ) : (
          <p className="text-sm text-gray-500">
            Please select a country first.
          </p>
        )}

        {selectedService && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Service</th>
                  <th className="border px-4 py-2">Country</th>
                  <th className="border px-4 py-2">Price (USD)</th>
                  <th className="border px-4 py-2">Stock</th>
                  <th className="border px-4 py-2">Save</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td className="border px-4 py-2">
                    <div className="inline-flex items-center gap-2">
                      <img
                        src={getServiceLogoUrl(
                          selectedService.label.toLowerCase()
                        )}
                        alt="logo"
                        className="h-5 w-5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src =
                            "/default-logo.png";
                        }}
                      />
                      {selectedService.label}
                    </div>
                  </td>

                  <td className="border px-4 py-2">
                    <div className="inline-flex items-center gap-2">
                      <img
                        src={selectedCountry?.flagUrl}
                        alt={selectedCountry?.label}
                        className="h-5 w-5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src =
                            "/default-flag.png";
                        }}
                      />
                      {selectedCountry?.label}
                    </div>
                  </td>

                  <td className="border px-4 py-2">
                    {Number(selectedService.price)
                      ? (Number(selectedService.price) * 1.5).toFixed(2)
                      : "N/A"}
                  </td>

                  <td className="border px-4 py-2">
                    {selectedService.stock || 0}
                  </td>

                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={handleSave}
                      className="flex items-center justify-center gap-1 text-green-500 hover:text-green-700"
                    >
                      <FaSave />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button
        onClick={handleRequestNumber}
        className={`bg-blue-500 text-white px-4 py-2 rounded ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        }`}
        disabled={loading}
      >
        {loading ? "Processing..." : "Get Number"}
      </button>

      <OtpHelp />

      <div className="mt-8">
        <div className="flex justify-between border-b pb-2">
          <button
            onClick={() => setActiveTab("Active")}
            className={`px-4 pb-2 ${
              activeTab === "Active"
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-gray-600"
            }`}
          >
            Active orders
          </button>
          <button
            onClick={() => setActiveTab("History")}
            className={`px-4 pb-2 ${
              activeTab === "History"
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-gray-600"
            }`}
          >
            Order history
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "Active" ? (
            activeOrders.filter((o) => o.number.includes(search)).length > 0 ? (
              activeOrders
                .filter((o) => o.number.includes(search))
                .map((order) => (
                  <ActiveOrder
                    key={order.orderId}
                    order={order}
                    countdown={getCountdown(order.expires)}
                    onFetchSms={() => fetchSmsCode(order.orderId)}
                    onCancel={() => cancelOrder(order.orderId)}
                  />
                ))
            ) : (
              <OrderEmpty />
            )
          ) : historyOrders.filter((o) => o.number.includes(search)).length >
            0 ? (
            <OrderHistory />
          ) : (
            <p className="text-gray-500 text-center">No order history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sms;
