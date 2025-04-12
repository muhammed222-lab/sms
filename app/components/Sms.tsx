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
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import SuccessNotification from "./sms_components/SuccessNotification";
import ActiveOrder from "./sms_components/ActiveOrder";
import OrderHistory, { SmsOrder } from "./sms_components/OrderHistory";
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

interface UserSettings {
  currency: string;
  delete_account: boolean;
  get_email_updates: boolean;
  make_me_extra_private: boolean;
  notification_sound: boolean;
  remove_all_history: boolean;
  user_email: string;
  username: string;
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
  const [balance, setBalance] = useState<number>(0);
  const [orders, setOrders] = useState<SmsOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active");
  const [search, setSearch] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [servicePage, setServicePage] = useState(1);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [rubToUsdRate, setRubToUsdRate] = useState<number>(0.011);
  const pageSize = 20;

  const calculateFinalPrice = (rubPrice: number): number => {
    const priceInUsd = rubPrice * rubToUsdRate;
    return parseFloat((priceInUsd * 1.3).toFixed(2));
  };

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const rubRes = await fetch("https://open.er-api.com/v6/latest/RUB");
        const rubData = await rubRes.json();
        if (rubData.rates?.USD) {
          setRubToUsdRate(rubData.rates.USD);
        }
      } catch (error) {
        console.error("Using default exchange rate due to API error:", error);
      }
    };

    fetchExchangeRates();
  }, []);

  const fetchUserSettings = async (email: string) => {
    try {
      const settingsQuery = query(
        collection(db, "settings"),
        where("user_email", "==", email)
      );
      const settingsSnapshot = await getDocs(settingsQuery);

      if (!settingsSnapshot.empty) {
        const settingsData = settingsSnapshot.docs[0].data() as UserSettings;
        setUserSettings(settingsData);
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email,
          displayName: currentUser.displayName,
        });

        if (currentUser.email) {
          await fetchUserSettings(currentUser.email);
        }

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
        setUserSettings(null);
      }
    });

    fetchCountries();
    return () => unsubscribe();
  }, []);

  const getServiceLogoUrl = (serviceName: string) => {
    return `https://logo.clearbit.com/${serviceName}.com`;
  };

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

          if (operatorData && operatorData.cost) {
            services.push({
              label: productName,
              value: productName.toLowerCase(),
              price: operatorData.cost,
              stock: operatorData.count,
              country: countryName.toLowerCase(),
            });
          }
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
    if (!selectedCountry || !selectedService?.value || !user?.email) {
      setMessage({
        type: "error",
        content: "Please select both a country and service.",
      });
      return;
    }

    if (rubToUsdRate === null) {
      setMessage({
        type: "error",
        content: "Exchange rates not available. Please try again later.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const token = await currentUser.getIdToken();
      const response = await fetch(
        `/api/proxy-sms?action=buy-activation&country=${selectedCountry.value}&operator=any&product=${selectedService.value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Failed to parse API response");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Failed to purchase number");
      }

      if (data.error === "no free phones") {
        throw new Error(
          "No available numbers for this service. Please try another service."
        );
      }

      const finalPriceCalc = selectedService.price
        ? calculateFinalPrice(Number(selectedService.price))
        : 0;

      if (balance < finalPriceCalc) {
        throw new Error(
          `Insufficient balance. You need $${finalPriceCalc.toFixed(
            2
          )} USD. Current balance: $${balance.toFixed(
            2
          )} USD. Please fund your account.`
        );
      }
      const orderData: SmsOrder = {
        id: Number(data.id),
        orderId: data.id.toString(),
        phone: data.phone,
        operator: data.operator || "any",
        product: selectedService.value,
        price: finalPriceCalc.toString(),
        status: data.status || "PENDING",
        expires: data.expires,
        sms: null,
        created_at: new Date().toISOString(),
        country: data.country || selectedCountry.value,
        number: data.phone,
        user_email: user.email,
        service: selectedService.value,
        priceRub: data.price.toString(),
        originalPrice: (Number(data.price) * rubToUsdRate).toFixed(2),
        localCurrency: "USD",
        is_reused: false,
        priceLocal: finalPriceCalc.toFixed(2), // now a valid string value
      };

      await addDoc(collection(db, "sms_orders"), orderData);
      setOrders((prev) => [...prev, orderData]);

      const userBalanceQuery = query(
        collection(db, "userDeposits"),
        where("email", "==", user.email)
      );
      const userBalanceSnapshot = await getDocs(userBalanceQuery);

      if (!userBalanceSnapshot.empty) {
        const userDoc = userBalanceSnapshot.docs[0];
        const currentBalance = userDoc.data().amount || 0;
        const newBalance = parseFloat(
          (currentBalance - finalPriceCalc).toFixed(2)
        );
        await updateDoc(userDoc.ref, { amount: newBalance });
        setBalance(newBalance);
      }

      setMessage({
        type: "success",
        content: `Number purchased successfully for $${finalPriceCalc.toFixed(
          2
        )} USD!`,
      });
      setShowSuccess(true);
      setSuccessMessage("Number purchased successfully!");
    } catch (error: any) {
      console.error("Error requesting number:", error);
      setMessage({
        type: "error",
        content: error.message || "Failed to request number. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderServicePrice = (service: any) => {
    if (!service.price) return "Loading...";
    const finalPriceCalc = service.price
      ? calculateFinalPrice(Number(service.price))
      : 0;
    return `$${finalPriceCalc.toFixed(2)} USD`;
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
        setShowSuccess(true);
        setSuccessMessage("SMS code received successfully!");
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
        const orderData = orderDoc.data();

        const refundAmount = parseFloat(orderData.price);

        await updateDoc(orderDoc.ref, {
          status: "CANCELED",
        });

        const userBalanceQuery = query(
          collection(db, "userDeposits"),
          where("email", "==", currentUser.email)
        );
        const userBalanceSnapshot = await getDocs(userBalanceQuery);

        if (!userBalanceSnapshot.empty) {
          const userDoc = userBalanceSnapshot.docs[0];
          const currentBalance = userDoc.data().amount || 0;
          const newBalance = currentBalance + refundAmount;
          await updateDoc(userDoc.ref, { amount: newBalance });
          setBalance(newBalance);
        }

        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === orderId
              ? { ...order, status: "CANCELED", sms: order.sms }
              : order
          )
        );

        setMessage({
          type: "success",
          content: `Order cancelled successfully. $${refundAmount.toFixed(
            2
          )} USD has been refunded to your balance.`,
        });
        setShowSuccess(true);
        setSuccessMessage("Order cancelled successfully!");
      }
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
        const finalPriceCalc = data.price
          ? calculateFinalPrice(Number(data.price))
          : 0;

        if (balance < finalPriceCalc) {
          throw new Error(
            `Insufficient balance. You need $${finalPriceCalc.toFixed(
              2
            )} USD. Current balance: $${balance.toFixed(
              2
            )} USD. Please fund your account.`
          );
        }

        const newOrder: SmsOrder = {
          id: Number(data.id),
          orderId: data.id.toString(),
          phone: data.phone,
          operator: data.operator || order.operator,
          product: order.product,
          price: finalPriceCalc.toFixed(2),
          status: data.status || "PENDING",
          expires: data.expires,
          sms: null,
          created_at: new Date().toISOString(),
          country: data.country || order.country,
          number: data.phone,
          user_email: currentUser.email || "",
          service: order.service,
          priceRub: Number(data.price).toString(),
          is_reused: true,
          localCurrency: "USD",
          originalPrice: (Number(data.price) * rubToUsdRate).toFixed(2),
          priceLocal: finalPriceCalc.toFixed(2), // Now never undefined
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
          const newBalance = parseFloat(
            (currentBalance - finalPriceCalc).toFixed(2)
          );
          await updateDoc(userDoc.ref, { amount: newBalance });
          setBalance(newBalance);
        }

        setMessage({
          type: "success",
          content: `Number successfully re-bought for $${finalPriceCalc.toFixed(
            2
          )} USD.`,
        });
        setShowSuccess(true);
        setSuccessMessage("Number re-bought successfully!");
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

  const removeOrder = async (orderId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const orderQuery = query(
        collection(db, "sms_orders"),
        where("orderId", "==", orderId),
        where("user_email", "==", currentUser.email)
      );
      const orderSnapshot = await getDocs(orderQuery);

      if (!orderSnapshot.empty) {
        const orderDoc = orderSnapshot.docs[0];
        await deleteDoc(orderDoc.ref);
      }

      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));

      setMessage({
        type: "success",
        content: "Order removed successfully.",
      });
      setShowSuccess(true);
      setSuccessMessage("Order removed successfully!");
    } catch (error: any) {
      console.error("Error removing order:", error);
      setMessage({
        type: "error",
        content: error.message || "Failed to remove order. Please try again.",
      });
    }
  };

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
            <div className="md:hidden grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-medium">Service</div>
              <div className="p-2 flex items-center gap-2">
                <img
                  src={getServiceLogoUrl(selectedService.label.toLowerCase())}
                  alt="logo"
                  className="h-5 w-5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = "/default-logo.png";
                  }}
                />
                {selectedService.label}
              </div>

              <div className="bg-gray-100 p-2 rounded font-medium">Country</div>
              <div className="p-2 flex items-center gap-2">
                <img
                  src={selectedCountry?.flagUrl}
                  alt={selectedCountry?.label}
                  className="h-5 w-5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = "/default-flag.png";
                  }}
                />
                {selectedCountry?.label}
              </div>

              <div className="bg-gray-100 p-2 rounded font-medium">Price</div>
              <div className="p-2">
                {rubToUsdRate
                  ? `$${calculateFinalPrice(
                      Number(selectedService.price)
                    ).toFixed(2)} USD`
                  : "Loading..."}
              </div>

              <div className="bg-gray-100 p-2 rounded font-medium">Stock</div>
              <div className="p-2">{selectedService.stock || 0}</div>

              <div className="bg-gray-100 p-2 rounded font-medium">Save</div>
              <div className="p-2">
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-1 text-green-500 hover:text-green-700"
                >
                  <FaSave />
                </button>
              </div>
            </div>

            <table className="min-w-full border table-auto hidden md:table">
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
                    {rubToUsdRate
                      ? `$${calculateFinalPrice(
                          Number(selectedService.price)
                        ).toFixed(2)} USD`
                      : "Loading..."}
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
        className={`bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        } ${!selectedService ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={loading || !selectedService}
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
                    order={{
                      ...order,
                      sms: typeof order.sms === "string" ? order.sms : null,
                    }}
                    countdown={getCountdown(order.expires)}
                    onFetchSms={() => fetchSmsCode(order.orderId)}
                    onCancel={() => cancelOrder(order.orderId)}
                    onRemove={() => removeOrder(order.orderId)}
                    onRebuy={rebuyNumber}
                  />
                ))
            ) : (
              <OrderEmpty />
            )
          ) : historyOrders.filter((o) => o.number.includes(search)).length >
            0 ? (
            <OrderHistory
              orders={historyOrders.filter((o) => o.number.includes(search))}
              onRefresh={fetchSmsCode}
              onCancel={cancelOrder}
              onRemove={removeOrder}
              onRebuy={rebuyNumber}
            />
          ) : (
            <p className="text-gray-500 text-center">No order history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sms;
