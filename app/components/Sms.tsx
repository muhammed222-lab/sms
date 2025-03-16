/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { FaSave, FaClipboard } from "react-icons/fa";
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
import RecentSmsOrders from "./RecentSmsOrders";
import SmsPrice from "./SmsPrice";

// Define interfaces
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
}

interface RequestedNumber {
  request_id: string;
  number: string;
}

interface SmsOrder {
  orderId: string;
  number: string;
  code: string;
  country: string;
  service: string;
  applicationId: string;
  status: string;
  action: string;
  price: number;
  user_email: string;
  date: string;
  expireAt: string;
}

const Sms = () => {
  const [servicesLoading, setServicesLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [initialServices, setInitialServices] = useState<
    Array<
      SelectOption & {
        price: number;
        stock?: number | string;
        count?: number | string;
        country: string;
      }
    >
  >([]);
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  );
  const [selectedService, setSelectedService] = useState<
    SelectOption & {
      price: number;
      stock?: number | string;
      count?: number | string;
    }
  >();
  const [requestedNumber, setRequestedNumber] =
    useState<RequestedNumber | null>(null);
  const [smsCode, setSmsCode] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isFetchingCode, setIsFetchingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setBalance] = useState<number>(0);
  const [, setStatus] = useState<string>(""); // order status state
  const [orders, setOrders] = useState<SmsOrder[]>([]);
  const [previouslyGeneratedOrders, setPreviouslyGeneratedOrders] = useState<
    SmsOrder[]
  >([]);
  const currencyOptions = [
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
    { label: "GBP", value: "GBP" },
    { label: "NGN", value: "NGN" },
    { label: "JPY", value: "JPY" },
    { label: "AUD", value: "AUD" },
    { label: "CAD", value: "CAD" },
    { label: "CHF", value: "CHF" },
    { label: "CNY", value: "CNY" },
    { label: "SEK", value: "SEK" },
    { label: "NZD", value: "NZD" },
    { label: "KRW", value: "KRW" },
    { label: "INR", value: "INR" },
    { label: "RUB", value: "RUB" },
  ];
  const [selectedCurrency, setSelectedCurrency] = useState<SelectOption | null>(
    { label: "USD", value: "USD" }
  );

  const [servicePage, setServicePage] = useState(1);
  const pageSize = 20;
  const exchangeRates: { [key: string]: number } = {
    RUB: 1, // base
    USD: 0.012,
    EUR: 0.01,
    GBP: 0.0087,
    NGN: 5.5,
    JPY: 1.6,
    AUD: 0.016,
    CAD: 0.015,
    CHF: 0.013,
    CNY: 0.085,
    SEK: 0.11,
    NZD: 0.017,
    KRW: 14,
    INR: 0.9,
  };

  // Load countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/getsms/countries");
        const data = await res.json();
        const countryArray = Array.isArray(data) ? data : Object.values(data);
        const options = countryArray.map((country: any) => ({
          label: country.text_en,
          value: country.name
            ? country.name.toLowerCase()
            : country.text_en.toLowerCase(),
          flagUrl: `https://countryflagsapi.com/png/${encodeURIComponent(
            country.name
              ? country.name.toLowerCase()
              : country.text_en.toLowerCase()
          )}`,
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
    fetchCountries();
  }, []);

  // Fetch all services on mount.
  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const res = await fetch("/api/getsms/prices");
        const data = await res.json();
        console.log("Fetched all services:", data);
        const options = Array.isArray(data)
          ? data.map((service: any) => ({
              label: service.title,
              value: service.id,
              price: service.price,
              stock: service.stock ?? 0,
              count: service.count ?? 0,
              country: service.country,
              logoUrl: `https://logo.clearbit.com/${service.title}.com`,
            }))
          : [];
        // If a country is selected filter services accordingly.
        const filteredOptions =
          selectedCountry && options.length
            ? options.filter(
                (opt: any) =>
                  opt.country.toLowerCase() === selectedCountry.value
              )
            : options;
        setInitialServices(filteredOptions);
      } catch (error) {
        console.error("Error fetching all services:", error);
        setMessage({
          type: "error",
          content: "Error loading services from API.",
        });
      }
    };
    fetchAllServices();
  }, [selectedCountry]);

  // Load service options with lazy-loading/search.
  const loadServiceOptions = async (
    inputValue: string
  ): Promise<
    Array<
      SelectOption & {
        price: number;
        stock?: number | string;
        count?: number | string;
        country: string;
      }
    >
  > => {
    setServicesLoading(true);
    try {
      if (inputValue && inputValue.length >= 2) {
        let filtered = initialServices.filter((service) =>
          service.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        if (filtered.length === 0) {
          const res = await fetch(`/api/getsms/prices?search=${inputValue}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            filtered = data.map((service: any) => ({
              label: service.title,
              value: service.id,
              price: service.price,
              stock: service.stock ?? 0,
              count: service.count ?? 0,
              country: service.country,
              logoUrl: `https://logo.clearbit.com/${service.title}.com`,
            }));
            // Also filter by selected country if set.
            if (selectedCountry) {
              filtered = filtered.filter(
                (opt: any) =>
                  opt.country.toLowerCase() === selectedCountry.value
              );
            }
          }
        }
        return filtered;
      } else {
        const endIndex = servicePage * pageSize;
        return initialServices.slice(0, endIndex);
      }
    } catch (error) {
      console.error("Error loading services on search:", error);
      return [];
    } finally {
      setServicesLoading(false);
    }
  };

  const renderServiceSelect = () => (
    <AsyncSelect
      cacheOptions
      defaultOptions={initialServices.slice(0, pageSize)}
      loadOptions={loadServiceOptions}
      onChange={(option) =>
        setSelectedService(option as (typeof initialServices)[0])
      }
      placeholder="Search by service..."
      isLoading={servicesLoading}
      onMenuScrollToBottom={() => {
        setServicePage((prev) => prev + 1);
      }}
    />
  );

  // Firebase auth & balance
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email || null,
          displayName: currentUser.displayName || null,
        });
        try {
          const userEmail = currentUser.email || "";
          const q = query(
            collection(db, "userDeposits"),
            where("email", "==", userEmail)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setBalance(userData.amount ?? 0);
            setUserCurrency(userData.currency || "USD");
            setSelectedCurrency({
              label: userData.currency || "USD",
              value: userData.currency || "USD",
            });
          } else {
            setBalance(0);
          }
        } catch (error) {
          console.error("Error fetching user balance:", error);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load orders from local storage on mount.
  useEffect(() => {
    const storedOrders = localStorage.getItem("smsOrders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  // Save orders to local storage whenever orders state changes.
  useEffect(() => {
    localStorage.setItem("smsOrders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (user?.email) {
      const fetchOrders = async () => {
        const q = query(
          collection(db, "orders"),
          where("user_email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(
          (doc) => doc.data() as SmsOrder
        );
        setPreviouslyGeneratedOrders(ordersData);
      };
      fetchOrders();
    }
  }, [user]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage({ type: "success", content: "Copied!" });
      setTimeout(() => setMessage({ type: "", content: "" }), 5000);
    });
  };

  // Request number and create order; deduct cost immediately; also set expireAt (5 minutes later)
  const handleRequestNumber = async () => {
    if (!selectedCountry || !selectedService) {
      setMessage({
        type: "error",
        content: "Please select a country and service.",
      });
      return;
    }
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const vendorRes = await fetch("/api/getsms/vendor");
      const vendorData = await vendorRes.json();
      const vendorBalance = vendorData.balance || 0;
      if (vendorBalance < selectedService.price) {
        setMessage({
          type: "error",
          content:
            "Service is temporarily unavailable due to insufficient funds on our end. We apologize for the inconvenience.",
        });
        return;
      }
      const userEmail = user?.email || "";
      const userBalanceQuery = query(
        collection(db, "userDeposits"),
        where("email", "==", userEmail)
      );
      const userBalanceSnapshot = await getDocs(userBalanceQuery);
      if (!userBalanceSnapshot.empty) {
        const userDoc = userBalanceSnapshot.docs[0].data();
        const userBalanceInLocalCurrency = userDoc.amount || 0;
        if (userBalanceInLocalCurrency === 0) {
          setMessage({
            type: "error",
            content: "Your wallet is empty. Please fund your wallet.",
          });
          return;
        }
        const rate = exchangeRates[selectedCurrency?.value || "USD"] || 1;
        const servicePriceInUserCurrency = selectedService.price * rate;
        const totalPriceInUserCurrency = servicePriceInUserCurrency * 1.2;
        if (userBalanceInLocalCurrency < totalPriceInUserCurrency) {
          setMessage({
            type: "error",
            content: "Insufficient balance. Please top up your account.",
          });
          return;
        }
        const purchaseResponse = await fetch(
          `/api/getsms/buy-activation?country=${selectedCountry.value}&operator=any&product=${selectedService.value}`
        );
        const data = await purchaseResponse.json();
        if (data.number) {
          setRequestedNumber(data);
          setMessage({
            type: "success",
            content: `Number fetched successfully: ${data.number}`,
          });
          const newBalanceInLocalCurrency =
            userBalanceInLocalCurrency - totalPriceInUserCurrency;
          const userDocRef = userBalanceSnapshot.docs[0].ref;
          await updateDoc(userDocRef, { amount: newBalanceInLocalCurrency });
          // Set order expireAt 5 minutes later.
          const expireAt = new Date(Date.now() + 5 * 60000).toISOString();
          const newOrder: SmsOrder = {
            orderId: data.request_id,
            number: data.number,
            code: "",
            country: selectedCountry.label,
            service: selectedService.label,
            applicationId: selectedService.value,
            status: "Pending",
            action: "none",
            price: totalPriceInUserCurrency,
            user_email: user?.email || "",
            date: new Date().toISOString(),
            expireAt,
          };
          await addDoc(collection(db, "orders"), newOrder);
          setOrders((prev) => [...prev, newOrder]);
        } else {
          setMessage({
            type: "error",
            content: "Failed to fetch number. Please try again later.",
          });
        }
      } else {
        setMessage({
          type: "error",
          content: "No user balance found. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error requesting number:", error);
      setMessage({
        type: "error",
        content: "Failed to request a number. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch SMS code from API endpoint.
  const fetchSmsCode = async () => {
    if (!requestedNumber) {
      setMessage({ type: "error", content: "No requested number found." });
      return;
    }
    setIsFetchingCode(true);
    try {
      const response = await fetch(
        `/api/getsms/sms-inbox?id=${requestedNumber.request_id}`
      );
      const data = await response.json();
      if (data.sms && data.sms.length > 0) {
        const sms = data.sms[0];
        setSmsCode(sms.code);
        setMessage({ type: "success", content: "SMS code received." });
        // Optionally update order status here (eg. mark as Completed)
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === requestedNumber.request_id
              ? { ...order, code: sms.code, status: "Completed" }
              : order
          )
        );
      } else if (data.error_code === "wait_sms") {
        setMessage({
          type: "info",
          content: "Waiting for SMS. Please check back shortly.",
        });
      } else {
        throw new Error(data.error || "Failed to fetch SMS.");
      }
    } catch (error) {
      console.error("Error fetching SMS code:", error);
      setMessage({ type: "error", content: "Error fetching SMS code." });
    } finally {
      setIsFetchingCode(false);
    }
  };

  // Rebuy number using new endpoint – enabled only if order is expired.
  const rebuyNumber = async (order: SmsOrder) => {
    try {
      const response = await fetch(
        `/api/getsms/reuse?product=${order.applicationId}&number=${order.number}`
      );
      const data = await response.json();
      if (data.number) {
        setMessage({
          type: "success",
          content: "Number successfully re-bought.",
        });
      } else {
        setMessage({ type: "error", content: "Failed to rebuy the number." });
      }
    } catch (error) {
      console.error("Error re-buying number:", error);
      setMessage({
        type: "error",
        content: "Failed to rebuy the number. Please try again.",
      });
    }
  };

  // Cancel order using new endpoint – enabled only if no SMS code has been received.
  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/getsms/cancel-order?id=${orderId}`);
      const data = await response.json();
      if (data.number || data.message) {
        setMessage({
          type: "success",
          content: "Order cancelled successfully.",
        });
        // Update order status and restore balance (if needed).
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === orderId
              ? { ...order, status: "Cancelled" }
              : order
          )
        );
      } else {
        setMessage({ type: "error", content: "Failed to cancel the order." });
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      setMessage({
        type: "error",
        content: "Failed to cancel order. Please try again.",
      });
    }
  };

  // New Order Management table – persists via local storage.
  const renderOrderManagementTable = () => {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">Manage Orders</h3>
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-xs">Order ID</th>
              <th className="border px-2 py-1 text-xs">Country</th>
              <th className="border px-2 py-1 text-xs">Service</th>
              <th className="border px-2 py-1 text-xs">Number</th>
              <th className="border px-2 py-1 text-xs">Code</th>
              <th className="border px-2 py-1 text-xs">Status</th>
              <th className="border px-2 py-1 text-xs">Date</th>
              <th className="border px-2 py-1 text-xs">Expires At</th>
              <th className="border px-2 py-1 text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const currentTime = new Date().getTime();
              const expireTime = new Date(order.expireAt).getTime();
              const canCancel = order.code === ""; // disable cancel if SMS code received.
              const canRebuy = currentTime > expireTime; // active if expired.
              return (
                <tr key={order.orderId}>
                  <td className="border px-2 py-1 text-xs">{order.orderId}</td>
                  <td className="border px-2 py-1 text-xs">{order.country}</td>
                  <td className="border px-2 py-1 text-xs">{order.service}</td>
                  <td className="border px-2 py-1 text-xs">{order.number}</td>
                  <td className="border px-2 py-1 text-xs">
                    {order.code || "—"}
                  </td>
                  <td className="border px-2 py-1 text-xs">{order.status}</td>
                  <td className="border px-2 py-1 text-xs">
                    {new Date(order.date).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1 text-xs">
                    {new Date(order.expireAt).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1 text-xs">
                    <button
                      onClick={() => cancelOrder(order.orderId)}
                      disabled={!canCancel}
                      className={`text-red-500 text-xs mr-1 ${
                        !canCancel && "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => rebuyNumber(order)}
                      disabled={!canRebuy}
                      className={`text-yellow-500 text-xs ${
                        !canRebuy && "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Rebuy
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white border p-4 rounded-lg max-w-3xl mx-auto">
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
          options={countries}
          value={selectedCountry}
          onChange={setSelectedCountry}
          placeholder="Search by country..."
          isLoading={loading}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a service
        </label>
        {renderServiceSelect()}
        <div className="mb-2 mt-2">
          <label className="block text-xs font-medium mb-1">Currency</label>
          <select
            value={selectedCurrency?.value}
            onChange={(e) =>
              setSelectedCurrency({
                label: e.target.value,
                value: e.target.value,
              })
            }
            className="p-1 border rounded text-xs"
          >
            {currencyOptions.map((cur) => (
              <option key={cur.value} value={cur.value}>
                {cur.label}
              </option>
            ))}
          </select>
        </div>
        {selectedService && (
          <div className="mt-4">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Service</th>
                  <th className="border px-4 py-2">Country</th>
                  <th className="border px-4 py-2">Price (incl. commission)</th>
                  <th className="border px-4 py-2">Stock</th>
                  <th className="border px-4 py-2">Count</th>
                  <th className="border px-4 py-2">Save</th>
                  <th className="border px-4 py-2">Get SMS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">
                    <img
                      src={selectedService.logoUrl}
                      alt="logo"
                      style={{ height: "20px", marginRight: "5px" }}
                    />
                    {selectedService.label}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedCountry?.label || "0"}
                  </td>
                  <td className="border px-4 py-2">
                    {(
                      selectedService.price *
                      (exchangeRates[selectedCurrency?.value || "USD"] || 1) *
                      1.2
                    ).toFixed(2)}{" "}
                    {selectedCurrency?.value}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedService.stock || 0}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedService.count || 0}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={handleRequestNumber}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaSave />
                    </button>
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={fetchSmsCode}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Get SMS
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
      {requestedNumber && (
        <div className="mt-4">
          <p className="text-sm">Phone Number: {requestedNumber.number}</p>
          <button
            onClick={() => handleCopy(requestedNumber.number)}
            className="text-blue-500 text-sm flex items-center gap-1"
          >
            <FaClipboard /> Copy
          </button>
          <div className="mt-4 flex gap-2">
            <button
              onClick={fetchSmsCode}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={isFetchingCode}
            >
              {isFetchingCode ? "Waiting for Code..." : "Fetch SMS Code"}
            </button>
            {requestedNumber && (
              <>
                <button
                  onClick={() =>
                    rebuyNumber({
                      orderId: requestedNumber.request_id,
                      number: requestedNumber.number,
                      code: "",
                      country: selectedCountry?.label || "",
                      service: selectedService?.label || "",
                      applicationId: selectedService?.value || "",
                      status: "Pending",
                      action: "none",
                      price: 0,
                      user_email: user?.email || "",
                      date: new Date().toISOString(),
                      expireAt: "", // This will already have been set.
                    })
                  }
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Rebuy Number
                </button>
                <button
                  onClick={() => cancelOrder(requestedNumber.request_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel Order
                </button>
              </>
            )}
          </div>
          {smsCode && <p className="text-sm mt-2">SMS Code: {smsCode}</p>}
        </div>
      )}
      <RecentSmsOrders
        orders={orders}
        previouslyGeneratedOrders={previouslyGeneratedOrders}
        rejectNumber={async (orderId: string, requestId: string) =>
          Promise.resolve()
        }
        fetchSmsCode={fetchSmsCode}
        handleCopy={handleCopy}
      />
      <SmsPrice />
      {orders.length > 0 && renderOrderManagementTable()}
    </div>
  );
};

export default Sms;
function setUserCurrency(arg0: any) {
  throw new Error("Function not implemented.");
}
