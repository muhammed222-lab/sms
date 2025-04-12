/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

  useEffect(() => {
    const fetchFreeNumbers = async () => {
      try {
        // First check prices to find free/low-cost numbers
        const pricesResponse = await fetch("https://5sim.net/v1/guest/prices");
        const pricesData = await pricesResponse.json();

        // Find countries with free/cheap numbers
        const affordableCountries = Object.entries(pricesData)
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
          .filter((item) => item.price <= 1 && item.count > 0) // Filter for affordable available numbers
          .slice(0, 5); // Limit to 5 results

        setNumbers(affordableCountries);
      } catch (err) {
        setError("Failed to load available numbers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreeNumbers();
  }, []);

  const handleGetNumber = async (
    country: string,
    product: string,
    operator: string
  ) => {
    try {
      setSmsLoading(true);
      // Purchase the number (using guest endpoint if possible, or your API key)
      const response = await fetch(
        `https://5sim.net/v1/user/buy/activation/${country}/${operator}/${product}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_FIVESIM_API_KEY}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to purchase number");
      }

      const numberData: NumberItem = await response.json();
      setActiveNumber(numberData);

      // Start checking for SMS
      checkForSMS(numberData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get number");
    } finally {
      setSmsLoading(false);
    }
  };

  const checkForSMS = async (orderId: number) => {
    try {
      const response = await fetch(
        `https://5sim.net/v1/user/check/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_FIVESIM_API_KEY}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check for SMS");
      }

      const data: NumberItem = await response.json();

      if (data.sms && data.sms.length > 0) {
        setActiveNumber(data);
        return; // Stop checking if we got SMS
      }

      // Continue checking every 5 seconds if no SMS yet
      setTimeout(() => checkForSMS(orderId), 5000);
    } catch (err) {
      console.error("Error checking SMS:", err);
      // Retry after 5 seconds
      setTimeout(() => checkForSMS(orderId), 5000);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl mt-4 border overflow-hidden md:max-w-2xl">
      <div className="p-6">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
          Free Burner Numbers
        </div>
        <p className="mt-2 text-gray-500">
          Get a free temporary number for verification
        </p>

        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
            {activeNumber ? (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-medium">{activeNumber.product}</h3>
                    <p className="text-lg font-semibold">
                      {activeNumber.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(activeNumber.expires).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Active
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Received SMS
                  </h4>
                  {activeNumber.sms?.length > 0 ? (
                    <div className="space-y-2">
                      {activeNumber.sms.map((sms, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{sms.sender}</span>
                            <span className="text-gray-500">
                              {new Date(sms.date).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="mt-1">{sms.text}</p>
                          {sms.code && (
                            <div className="mt-2 p-2 bg-indigo-50 text-indigo-700 rounded">
                              <strong>Code:</strong> {sms.code}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {smsLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Waiting for SMS...</span>
                        </div>
                      ) : (
                        "No messages yet"
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : numbers.length > 0 ? (
              numbers.map((num, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{num.product}</p>
                    <p className="text-sm text-gray-500">
                      {num.country} • {num.operator} • {num.price} credit(s)
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleGetNumber(num.country, num.product, num.operator)
                    }
                    disabled={smsLoading}
                    className={`px-4 py-2 text-white rounded transition ${
                      smsLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-500 hover:bg-indigo-600"
                    }`}
                  >
                    {smsLoading ? "Getting..." : "Get Number"}
                  </button>
                </div>
              ))
            ) : (
              <div className="mt-6 p-6 bg-blue-50 rounded-lg text-center">
                <p className="text-gray-700 mb-4">
                  No free numbers available right now
                </p>
                <Link
                  href="/signin"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Sign In for More Numbers
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
