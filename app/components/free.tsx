/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/FreeNumberComponent.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Inbox,
} from "lucide-react";

interface NumberItem {
  id: number;
  phone: string;
  operator: string;
  product: string;
  status: string;
  expires: string;
  sms: SMSItem[];
  country: string;
}

interface SMSItem {
  created_at: string;
  date: string;
  sender: string;
  text: string;
  code: string;
}

export default function FreeNumberComponent() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNumber, setActiveNumber] = useState<NumberItem | null>(null);
  const [smsLoading, setSmsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFreeNumbers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/free/proxy");
      if (!response.ok) throw new Error("Failed to fetch prices");

      const pricesData = await response.json();

      // Find products with cost = 0 (free) and count > 0 (available)
      const freeNumbers = Object.entries(pricesData)
        .flatMap(([country, products]: [string, any]) =>
          Object.entries(products).flatMap(
            ([product, operators]: [string, any]) =>
              Object.entries(operators).map(
                ([operator, details]: [string, any]) => ({
                  country,
                  product,
                  operator,
                  price: details.cost,
                  count: details.count,
                })
              )
          )
        )
        .filter((item) => item.price === 0 && item.count > 0)
        .slice(0, 5); // Limit to 5 free numbers

      setNumbers(freeNumbers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load numbers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFreeNumbers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFreeNumbers();
  };

  const handleGetNumber = async (
    country: string,
    product: string,
    operator: string
  ) => {
    try {
      setSmsLoading(true);
      const response = await fetch(
        `/api/free/proxy-buy?country=${country}&operator=${operator}&product=${product}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get free number");
      }

      const numberData: NumberItem = await response.json();
      setActiveNumber(numberData);
      checkForSMS(numberData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get number");
    } finally {
      setSmsLoading(false);
    }
  };

  const checkForSMS = async (orderId: number) => {
    try {
      const response = await fetch(`/api/free/proxy-check?orderId=${orderId}`);
      if (!response.ok) throw new Error("Failed to check for SMS");

      const data: NumberItem = await response.json();
      if (data.sms?.length > 0) {
        setActiveNumber(data);
        return;
      }
      setTimeout(() => checkForSMS(orderId), 5000);
    } catch (err) {
      console.error("Error checking SMS:", err);
      setTimeout(() => checkForSMS(orderId), 5000);
    }
  };

  const formatExpiration = (expires: string) => {
    const date = new Date(expires);
    const now = new Date();
    const diffMinutes = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffMinutes <= 0) return "Expired";
    if (diffMinutes < 60) return `Expires in ${diffMinutes} min`;
    return `Expires in ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`;
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border mt-6 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Temporary Numbers
            </h2>
            <p className="text-gray-600">Get free numbers for verification</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : activeNumber ? (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-indigo-50 p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-indigo-800">
                  {activeNumber.product}
                </h3>
                <p className="text-xl font-bold">{activeNumber.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white text-indigo-600 rounded-full text-sm font-medium">
                  {activeNumber.country}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Number Details</h4>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatExpiration(activeNumber.expires)}
                </span>
              </div>

              <div className="space-y-4">
                {activeNumber.sms?.length > 0 ? (
                  activeNumber.sms.map((sms, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{sms.sender}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(sms.date).toLocaleTimeString()}
                          </p>
                        </div>
                        {sms.code && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                            Code: {sms.code}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-gray-700">{sms.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      {smsLoading ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                          <p>Waiting for incoming messages...</p>
                        </>
                      ) : (
                        <>
                          <Inbox className="h-6 w-6" />
                          <p>No messages received yet</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : numbers.length > 0 ? (
          <div className="grid gap-4">
            {numbers.map((num, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{num.product}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {num.country}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {num.operator}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {num.price} credit
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleGetNumber(num.country, num.product, num.operator)
                    }
                    disabled={smsLoading}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                      smsLoading
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {smsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Get Number"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-xl p-6 inline-block">
              <div className="flex flex-col items-center gap-4">
                <Inbox className="h-10 w-10 text-blue-500" />
                <h3 className="text-lg font-medium text-gray-800">
                  No numbers available
                </h3>
                <p className="text-gray-600 max-w-md">
                  There are currently no free numbers available. Please try
                  again later or sign in for more options.
                </p>
                <Link
                  href="/signin"
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
