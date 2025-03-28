/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import {
  IoIosCloseCircle,
  IoIosCheckmarkCircle,
  IoIosTime,
  IoIosRefresh,
  IoIosSearch,
} from "react-icons/io";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

// Helper: Return FlagCDN URL (expects a two-letter ISO country code)
const getFlagUrl = (country: string) => {
  return `https://flagcdn.com/w40/${country.toLowerCase()}.png`;
};

// Helper: Return Service Icon URL (using Clearbit Logo API)
// It expects that the service name is also the domain base (for example: "airbnb" returns "https://logo.clearbit.com/airbnb.com")
const getServiceIconUrl = (service: string) => {
  return `https://logo.clearbit.com/${service.toLowerCase()}.com`;
};

interface SmsOrder {
  id: number;
  orderId: string;
  phone: string;
  operator: string;
  product: string;
  price: string; // Price in RUB coming directly from the API
  status: string;
  expires: string;
  sms: string | null;
  created_at: string;
  country: string;
  number: string;
  user_email: string;
  service: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<SmsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  // We'll store the NGN-to-USD rate and RUB-to-USD rate.
  // According to Google, 1 RUB = 0.012 USD.
  const rubToUsdRate = 0.012;
  const [ngnToUsdRate, setNgnToUsdRate] = useState<number | null>(null);

  // Fetch live conversion rate from NGN to USD using a free API
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Using open.er-api.com for a free, accurate NGN-to-USD conversion rate
        const res = await fetch("https://open.er-api.com/v6/latest/NGN");
        if (!res.ok) {
          console.error("Failed to fetch NGN exchange rate");
          return;
        }
        const data = await res.json();
        // data.rates.USD is the value of 1 NGN in USD
        setNgnToUsdRate(data.rates.USD);
      } catch (error) {
        console.error("Exchange rate error:", error);
      }
    };
    fetchExchangeRate();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
        await fetchOrders(user.email);
      } else {
        setUserEmail(null);
        setOrders([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchOrders = async (email: string) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "sms_orders"),
        where("user_email", "==", email),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      const firestoreOrders = querySnapshot.docs.map(
        (doc) => doc.data() as SmsOrder
      );
      const ordersWithDetails = await Promise.all(
        firestoreOrders.map(async (order) => {
          try {
            const response = await fetch(
              `/api/proxy-order-history?orderId=${order.orderId}`
            );
            if (!response.ok) {
              console.error(`Failed to fetch order ${order.orderId}`);
              return order;
            }
            const orderDetails = await response.json();
            return { ...order, ...orderDetails };
          } catch (error) {
            console.error(`Error fetching order ${order.orderId}:`, error);
            return order;
          }
        })
      );
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (!userEmail) return;
    setRefreshing(true);
    await fetchOrders(userEmail);
  };

  const handleRebuy = async (order: SmsOrder) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch(
        `/api/proxy-sms?action=reuse-number&product=${
          order.product
        }&number=${order.phone.replace("+", "")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to rebuy number");
      }
      const data = await res.json();
      if (data.id && userEmail) {
        await fetchOrders(userEmail);
      }
    } catch (error) {
      console.error("Rebuy error:", error);
    }
  };

  const getStatusBadge = (order: SmsOrder) => {
    const now = new Date();
    const expires = new Date(order.expires);
    if (now > expires) {
      return (
        <span className="flex items-center gap-1 text-red-500">
          <IoIosCloseCircle className="text-xl" /> Expired
        </span>
      );
    }
    switch (order.status) {
      case "RECEIVED":
        return (
          <span className="flex items-center gap-1 text-green-500">
            <IoIosCheckmarkCircle className="text-xl" /> Active
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-yellow-500">
            <IoIosTime className="text-xl" /> Pending
          </span>
        );
      case "FINISHED":
        return <span className="text-blue-500">Completed</span>;
      case "BANNED":
        return <span className="text-red-500">Banned</span>;
      case "CANCELED":
        return <span className="text-gray-500">Canceled</span>;
      default:
        return <span className="text-gray-500">{order.status}</span>;
    }
  };

  const getTimeRemaining = (expires: string) => {
    const now = new Date();
    const expiryDate = new Date(expires);
    const diffMs = expiryDate.getTime() - now.getTime();
    if (diffMs <= 0) return "Expired";
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  // Convert the order price (which is in RUB) to USD using a fixed rate from Google.
  const convertRubToUsd = (priceRub: string) => {
    const priceNumber = parseFloat(priceRub);
    return (priceNumber * rubToUsdRate).toFixed(2);
  };

  // Deduct the amount – where the amount to deduct is Price in USD plus 50% markup.
  // Before deducting, convert the user's NGN balance to USD using the live NGN-to-USD rate.
  const calculateDeductionInNgn = (priceRub: string) => {
    const priceUsd = parseFloat(convertRubToUsd(priceRub));
    const totalUsd = priceUsd * 1.5; // Adding 50%
    if (ngnToUsdRate && ngnToUsdRate > 0) {
      // Convert USD to NGN: NGN = USD / (NGN-to-USD rate)
      return (totalUsd / ngnToUsdRate).toFixed(2);
    }
    return "";
  };

  // Format price display: show price in USD (converted from RUB) and equivalent NGN price
  const formatPrice = (priceRub: string) => {
    const priceUsd = convertRubToUsd(priceRub);
    if (ngnToUsdRate && ngnToUsdRate > 0) {
      const priceNgn = (parseFloat(priceUsd) / ngnToUsdRate).toFixed(2);
      return `$${priceUsd} USD / ₦${priceNgn} NGN`;
    }
    return `$${priceUsd} USD`;
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Orders</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoIosSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <IoIosRefresh
                className={`text-xl ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm ? "No matching orders found" : "No orders yet"}
            </div>
            {!searchTerm && (
              <button
                onClick={() => (window.location.href = "/buy")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Buy a Number
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getFlagUrl(order.country)}
                        alt={order.country}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                            "/default-flag.png")
                        }
                      />
                      <img
                        src={getServiceIconUrl(order.service)}
                        alt={order.service}
                        className="w-6 h-6 object-contain"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                            "/default-logo.png")
                        }
                      />
                      <div>
                        <h3 className="font-semibold text-lg capitalize text-gray-800">
                          {order.service}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Order #{order.orderId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order)}
                      <span className="text-sm text-gray-500">
                        {getTimeRemaining(order.expires)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </p>
                      <p className="font-mono text-gray-800">{order.number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Country
                      </p>
                      <p className="capitalize text-gray-800">
                        {order.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Price
                      </p>
                      <p className="text-gray-800">
                        {formatPrice(order.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        SMS Code
                      </p>
                      <p className="font-mono text-lg">
                        {order.sms || (
                          <span className="text-gray-400">
                            Waiting for code...
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRebuy(order)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Rebuy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
