/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import {
  FaSave,
  FaClipboard,
  FaSearch,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import SuccessNotification from "./sms_components/SuccessNotification";
import ActiveOrder from "./sms_components/ActiveOrder";
import OrderHistory, { SmsOrder } from "./sms_components/OrderHistory";
import OtpHelp from "./OtpHelp";
import OrderEmpty from "./OrderEmpty";

// Define popular services that work well with specific countries
const RECOMMENDED_SERVICES: Record<string, string[]> = {
  usa: [
    "google",
    "facebook",
    "twitter",
    "microsoft",
    "amazon",
    "whatsapp",
    "instagram",
    "tiktok",
  ],
  russia: [
    "vkontakte",
    "telegram",
    "avito",
    "yandex",
    "wildberries",
    "mailru",
    "ok",
  ],
  ukraine: ["telegram", "olx", "rozetka", "prom", "ukrnet", "nova_poshta"],
  india: [
    "whatsapp",
    "flipkart",
    "amazon",
    "jiomart",
    "zomato",
    "swiggy",
    "paytm",
  ],
  brazil: ["whatsapp", "mercado", "magazineluiza", "americanas", "casasbahia"],
  uk: ["whatsapp", "amazon", "ebay", "asos", "deliveroo", "tesco"],
  germany: ["whatsapp", "amazon", "ebay", "zalando", "lieferando"],
  france: ["whatsapp", "amazon", "leboncoin", "fnac", "deliveroo"],
};

// Common error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  "no free phones":
    "No available numbers for this service. Please try another service or country.",
  "not enough user balance":
    "Insufficient balance. Please top up your account.",
  "select country": "Please select a country first.",
  "select operator": "Please select an operator.",
  "bad country": "This country is not supported or invalid.",
  "bad operator": "This operator is not supported or invalid.",
  "no product": "This service is not available. Please try another one.",
  "server offline": "Service temporarily unavailable. Please try again later.",
  "400": "Invalid request. Please check your selections and try again.",
  "401": "Authentication failed. Please refresh the page.",
  "404": "Requested resource not found.",
  "500": "Server error. Please try again later.",
  "reuse not possible": "This number cannot be reused.",
  "reuse expired": "The reuse period for this number has expired.",
  default: "Something went wrong. Please try again.",
};

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
const hasSpecialPricing = (
  country: string | null,
  service: string | null
): boolean => {
  if (!country || !service) return false;

  const specialCountries = ["usa", "uk", "nigeria"];
  const specialService = "whatsapp";

  return (
    specialCountries.includes(country.toLowerCase()) &&
    service.toLowerCase() === specialService
  );
};
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
  const [recommendedServices, setRecommendedServices] = useState<string[]>([]);
  const [savedServices, setSavedServices] = useState<any[]>([]);
  const pageSize = 20;

  // Get user-friendly error message
  const getErrorMessage = (
    error: string | { error?: string; message?: string }
  ): string => {
    if (typeof error === "string") {
      return (
        ERROR_MESSAGES[error.toLowerCase()] ||
        ERROR_MESSAGES[error.split(" ").join("").toLowerCase()] ||
        ERROR_MESSAGES.default
      );
    }

    const errorKey = error.error || error.message || "";
    return (
      ERROR_MESSAGES[errorKey.toLowerCase()] ||
      ERROR_MESSAGES[errorKey.split(" ").join("").toLowerCase()] ||
      ERROR_MESSAGES.default
    );
  };

  const calculateFinalPrice = (
    rubPrice: number,
    country?: string | null,
    service?: string | null
  ): number => {
    // Apply special pricing for WhatsApp in USA/UK/Nigeria
    if (country && service && hasSpecialPricing(country, service)) {
      return 0.5; // Fixed $0.50 price
    }

    // Normal pricing calculation
    const priceInUsd = rubPrice * rubToUsdRate;
    return parseFloat((priceInUsd * 1.3).toFixed(2));
  };

  // Load saved services from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedServices");
    if (saved) {
      try {
        setSavedServices(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved services", e);
      }
    }
  }, []);

  // Save services to localStorage when they change
  useEffect(() => {
    if (savedServices.length > 0) {
      localStorage.setItem("savedServices", JSON.stringify(savedServices));
    }
  }, [savedServices]);

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

  // Set recommended services when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryKey = selectedCountry.value.toLowerCase();
      setRecommendedServices(RECOMMENDED_SERVICES[countryKey] || []);
    } else {
      setRecommendedServices([]);
    }
  }, [selectedCountry]);

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
        content: "Failed to load countries. Please refresh the page.",
      });
    }
  };

  const fetchServices = async (country?: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setServicesLoading(true);
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
        content: "Failed to load services. Please try again.",
      });
    } finally {
      setServicesLoading(false);
    }
  };

  const loadServiceOptions = async (inputValue: string) => {
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
    }
  };

  const handleSaveService = () => {
    if (selectedService && selectedCountry) {
      const serviceToSave = {
        ...selectedService,
        country: selectedCountry.value,
        countryLabel: selectedCountry.label,
        flagUrl: selectedCountry.flagUrl,
        savedAt: new Date().toISOString(),
      };

      setSavedServices((prev) => {
        // Check if service already exists
        const exists = prev.some(
          (s) =>
            s.value === serviceToSave.value &&
            s.country === serviceToSave.country
        );

        if (exists) {
          return prev; // Don't add duplicate
        }

        const updated = [...prev, serviceToSave];
        // Keep only the 5 most recent saves
        return updated.slice(-5);
      });

      setSuccessMessage(
        `${selectedService.label} saved for ${selectedCountry.label}`
      );
      setShowSuccess(true);
    }
  };

  const handleLoadSavedService = (service: any) => {
    const country = countries.find((c) => c.value === service.country);
    if (country) {
      setSelectedCountry(country);
      setSelectedService({
        label: service.label,
        value: service.value,
        price: service.price,
        stock: service.stock,
      });
      setMessage({
        type: "success",
        content: `Loaded saved service: ${service.label} for ${country.label}`,
      });
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
        throw new Error("Failed to process the response");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Failed to purchase number");
      }

      if (data.error === "no free phones") {
        throw new Error(
          `No available numbers for ${selectedService.label} in ${selectedCountry.label}. Try another service.`
        );
      }

      const finalPriceCalc = selectedService.price
        ? calculateFinalPrice(
            Number(selectedService.price),
            selectedCountry?.value ?? null,
            selectedService.value
          )
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
        priceLocal: finalPriceCalc.toFixed(2),
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
        content: getErrorMessage(error.message),
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
      console.log("5sim API Response:", data); // Debug log

      // Handle 5sim's different response formats
      let smsCode = null;
      let smsStatus = "PENDING";

      // Format 1: SMS in array with code/text
      if (Array.isArray(data.sms) && data.sms.length > 0) {
        smsCode = data.sms[0].code || data.sms[0].text;
        smsStatus = "RECEIVED";
      }
      // Format 2: Direct SMS text
      else if (typeof data.sms === "string") {
        smsCode = data.sms;
        smsStatus = "RECEIVED";
      }
      // Format 3: 5sim's alternative format
      else if (data.text) {
        smsCode = data.text;
        smsStatus = "RECEIVED";
      }

      if (smsCode) {
        const orderQuery = query(
          collection(db, "sms_orders"),
          where("orderId", "==", orderId),
          where("user_email", "==", currentUser.email)
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, {
            sms: smsCode,
            status: smsStatus,
          });
        }

        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === orderId
              ? { ...order, sms: smsCode, status: smsStatus }
              : order
          )
        );

        setMessage({ type: "success", content: "SMS code received." });
        setShowSuccess(true);
        setSuccessMessage("SMS code received successfully!");
      }
      // Handle waiting states
      else if (data.status === "PENDING" || data.error_code === "wait_sms") {
        setMessage({
          type: "info",
          content: "Waiting for SMS. Code will show here once received.",
        });
      }
      // Handle other cases
      else {
        throw new Error(data.error || data.message || "No SMS received yet");
      }
    } catch (error: any) {
      console.error("Error fetching SMS code:", error);
      setMessage({
        type: "error",
        content: getErrorMessage(error.message),
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

        // Calculate refund amount based on what was actually charged
        const refundAmount = parseFloat(
          orderData.priceLocal || orderData.price
        );

        await updateDoc(orderDoc.ref, {
          status: "CANCELED",
          sms: orderData.sms || null, // Preserve existing SMS if any
        });

        // Refund user balance
        const userBalanceQuery = query(
          collection(db, "userDeposits"),
          where("email", "==", currentUser.email)
        );
        const userBalanceSnapshot = await getDocs(userBalanceQuery);

        if (!userBalanceSnapshot.empty) {
          const userDoc = userBalanceSnapshot.docs[0];
          const currentBalance = userDoc.data().amount || 0;
          const newBalance = parseFloat(
            (currentBalance + refundAmount).toFixed(2)
          );
          await updateDoc(userDoc.ref, { amount: newBalance });
          setBalance(newBalance);
        }

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  status: "CANCELED",
                  sms: order.sms || null,
                }
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
        content: getErrorMessage(error.message),
      });
    }
  };
  const rebuyNumber = async (order: SmsOrder) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const token = await currentUser.getIdToken();
      const response = await fetch(
        `/api/getsms/reuse?product=${encodeURIComponent(
          order.product
        )}&number=${encodeURIComponent(order.number.replace("+", ""))}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rebuy number");
      }

      // Handle successful rebuy
      const newOrder: SmsOrder = {
        id: data.id,
        orderId: data.id.toString(),
        phone: data.phone,
        operator: data.operator || order.operator,
        product: order.product,
        price: data.price.toString(),
        status: data.status || "PENDING",
        expires: data.expires,
        sms: null,
        created_at: new Date().toISOString(),
        country: data.country || order.country,
        number: data.phone,
        user_email: currentUser.email || "",
        service: order.service,
        priceRub: data.price.toString(),
        is_reused: true,
        localCurrency: "USD",
        originalPrice: (Number(data.price) * rubToUsdRate).toFixed(2),
        priceLocal: (Number(data.price) * rubToUsdRate).toFixed(2),
      };

      // Save to database and update state
      await setDoc(doc(db, "sms_orders", newOrder.orderId), newOrder);
      setOrders((prev) => [...prev, newOrder]);

      // Update balance
      const userBalanceQuery = query(
        collection(db, "userDeposits"),
        where("email", "==", currentUser.email)
      );
      const userBalanceSnapshot = await getDocs(userBalanceQuery);

      if (!userBalanceSnapshot.empty) {
        const userDoc = userBalanceSnapshot.docs[0];
        const currentBalance = userDoc.data().amount || 0;
        const newBalance = parseFloat(
          (currentBalance - Number(data.price) * rubToUsdRate).toFixed(2)
        );
        await updateDoc(userDoc.ref, { amount: newBalance });
        setBalance(newBalance);
      }

      setMessage({
        type: "success",
        content: `Number successfully re-bought for $${(
          Number(data.price) * rubToUsdRate
        ).toFixed(2)} USD.`,
      });
    } catch (error: any) {
      console.error("Error re-buying number:", error);
      setMessage({
        type: "error",
        content: error.message || "Failed to rebuy number",
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
        content: getErrorMessage(error.message),
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

  const renderServiceSelect = () => (
    <div className="relative">
      <AsyncSelect
        inputId="service-select"
        isDisabled={!selectedCountry}
        noOptionsMessage={() =>
          !selectedCountry
            ? "Please select a country first"
            : "No options found"
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
      {selectedCountry && (
        <div className="absolute right-2 top-2">
          <button
            onClick={handleSaveService}
            disabled={!selectedService}
            className={`text-gray-500 hover:text-blue-500 ${
              !selectedService ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Save this service for later"
          >
            <FaSave />
          </button>
        </div>
      )}
    </div>
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
          <>
            {recommendedServices.length > 0 && (
              <div className="mb-2">
                <p className="text-sm text-gray-500 mb-1">
                  Recommended for {selectedCountry.label}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendedServices.map((service) => (
                    <button
                      key={service}
                      onClick={() => {
                        const foundService = initialServices.find(
                          (s) => s.value === service
                        );
                        if (foundService) {
                          setSelectedService(foundService);
                        }
                      }}
                      className={`text-xs px-2 py-1 rounded hover:bg-blue-100 ${
                        selectedService?.value === service
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {savedServices.length > 0 && (
              <div className="mb-2">
                <p className="text-sm text-gray-500 mb-1">
                  Your saved services:
                </p>
                <div className="flex flex-wrap gap-2">
                  {savedServices
                    .filter((s) => s.country === selectedCountry.value)
                    .map((service) => (
                      <button
                        key={`${service.value}-${service.country}`}
                        onClick={() => handleLoadSavedService(service)}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
                      >
                        {service.label}
                        <span className="text-xs text-gray-500">
                          ({service.countryLabel})
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {renderServiceSelect()}
          </>
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
                {hasSpecialPricing(
                  selectedCountry?.value ?? null,
                  selectedService.value
                )
                  ? `$0.50 USD`
                  : rubToUsdRate
                  ? `$${calculateFinalPrice(
                      Number(selectedService.price)
                    ).toFixed(2)} USD`
                  : "Loading..."}
              </div>

              <div className="bg-gray-100 p-2 rounded font-medium">Stock</div>
              <div className="p-2">{selectedService.stock || 0}</div>
            </div>

            <table className="min-w-full border table-auto hidden md:table">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Service</th>
                  <th className="border px-4 py-2">Country</th>
                  <th className="border px-4 py-2">Price (USD)</th>
                  <th className="border px-4 py-2">Stock</th>
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
                    {hasSpecialPricing(
                      selectedCountry?.value ?? null,
                      selectedService.value
                    )
                      ? `$0.50 USD`
                      : rubToUsdRate
                      ? `$${calculateFinalPrice(
                          Number(selectedService.price)
                        ).toFixed(2)} USD`
                      : "Loading..."}
                  </td>

                  <td className="border px-4 py-2">
                    {selectedService.stock || 0}
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
