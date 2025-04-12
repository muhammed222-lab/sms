/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Crypto from "./Crypto";

interface FlutterwaveCheckoutOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
    theme?: {
      [key: string]: string;
    };
  };
  callback: (response: { transaction_id: string; status: string }) => void;
  onclose: () => void;
  meta?: {
    [key: string]: any;
  };
}

declare global {
  interface Window {
    FlutterwaveCheckout: (options: FlutterwaveCheckoutOptions) => void;
  }
}

const DashboardBalance: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<
    "flutterwave" | "Cryptocurrency" | null
  >(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  const publicKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "";

  // Payment options configuration
  const paymentMethods = [
    {
      id: "flutterwave",
      name: "Flutterwave",
      description: "Pay with card, bank transfer, or mobile money",
      logo: "/flutter.png",
      supportedOptions: ["card", "banktransfer", "mobilemoney", "ussd"],
    },
    {
      id: "Cryptocurrency",
      name: "Cryptocurrency",
      description: "Pay with Bitcoin, Ethereum, or USDT",
      logo: "/bitcoin.png",
    },
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Load Flutterwave script and config
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        // In a real app, you might fetch this from your API
        const config = {
          theme: {
            color: "#4F46E5",
            button_text: "#FFFFFF",
            button_color: "#4F46E5",
            background_color: "#F9FAFB",
            modal_color: "#FFFFFF",
          },
          display: {
            position: isMobile ? "center" : "right",
            floating: !isMobile,
          },
        };
        setPaymentConfig(config);
      } catch (error) {
        console.error("Error loading payment config:", error);
        // Fallback config
        setPaymentConfig({
          theme: {
            color: "#4F46E5",
            button_text: "#FFFFFF",
            button_color: "#4F46E5",
          },
        });
      }
    };

    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    script.onload = fetchPaymentConfig;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [isMobile]);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const data = await response.json();
        setExchangeRate(data.rates.NGN);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        setExchangeRate(1538.5);
      }
    };

    fetchExchangeRate();
  }, []);

  // Calculate USD amount when NGN amount changes
  useEffect(() => {
    if (amount && exchangeRate) {
      const calculatedUsd = amount / exchangeRate;
      setUsdAmount(parseFloat(calculatedUsd.toFixed(2)));
    } else {
      setUsdAmount(null);
    }
  }, [amount, exchangeRate]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user balance
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (user) {
        try {
          const email = user.email || "default@example.com";
          const q = query(
            collection(db, "userDeposits"),
            where("email", "==", email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data() as DocumentData;
            setBalance(userData.amount ?? 0);
          } else {
            setBalance(0);
          }
        } catch (error) {
          console.error("Error fetching user balance:", error);
          setError("Failed to load balance. Please refresh the page.");
        }
      }
    };

    fetchUserBalance();
  }, [user]);

  const handleTopUp = (method: "flutterwave" | "Cryptocurrency") => {
    setSelectedMethod(method);
    setError(null);
    setSuccess(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1000 && value <= 100000) {
      setAmount(value);
      setError(null);
    } else {
      setAmount(null);
      setError("Please enter an amount between ₦1,000 and ₦100,000");
    }
  };

  const handleFlutterwavePayment = async () => {
    if (!amount || !usdAmount) {
      setError("Please enter a valid amount between ₦1,000 and ₦100,000");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const transactionRef = `TX-${Date.now()}-${user?.uid || "guest"}`;

    try {
      const paymentOptions: any = {
        public_key: publicKey,
        tx_ref: transactionRef,
        amount: amount,
        currency: "NGN",
        payment_options: "card,mobilemoney,ussd,banktransfer",
        customer: {
          email: user?.email || "default@example.com",
          phone_number: user?.phoneNumber || "08012345678",
          name: user?.displayName || "Customer",
        },
        customizations: {
          title: "Top Up Balance",
          description: `Deposit ₦${amount.toLocaleString()} ($${usdAmount.toFixed(
            2
          )})`,
          logo: "/deemax.png",
        },
        meta: {
          user_id: user?.uid || "guest",
          app_version: "1.0.0",
        },
        callback: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/verify-transaction", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.NEXT_PUBLIC_API_SECRET || "",
              },
              body: JSON.stringify({ transactionId: response.transaction_id }),
            });

            if (!verifyResponse.ok) {
              throw new Error(`HTTP error! status: ${verifyResponse.status}`);
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.status !== "success" || !verifyData.data) {
              throw new Error(verifyData.message || "Verification failed");
            }

            const transactionData = verifyData.data;

            if (
              transactionData.status === "successful" &&
              transactionData.amount === amount &&
              transactionData.currency === "NGN"
            ) {
              setSuccess(
                "Payment verified successfully! Updating your balance..."
              );

              // Update user balance in USD
              const email = user?.email || "default@example.com";
              const depositCollection = collection(db, "userDeposits");
              const userQuery = query(
                depositCollection,
                where("email", "==", email)
              );
              const querySnapshot = await getDocs(userQuery);

              if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                const existingData =
                  querySnapshot.docs[0].data() as DocumentData;
                const newAmount = (existingData.amount || 0) + usdAmount;
                await updateDoc(docRef, { amount: newAmount });
              } else {
                await addDoc(depositCollection, {
                  email,
                  amount: usdAmount,
                  date: new Date().toISOString(),
                });
              }

              setBalance((prevBalance) => prevBalance + usdAmount);

              // Record transaction history
              await addDoc(collection(db, "deposit_history"), {
                user_email: email,
                amount: usdAmount,
                original_amount: amount,
                original_currency: "NGN",
                exchange_rate: exchangeRate,
                date: new Date(),
                mode: "Flutterwave",
                status: "success",
                transaction_id: response.transaction_id,
                flutterwave_data: transactionData,
              });

              // Handle referral commission
              const refersQuery = query(
                collection(db, "refers"),
                where("user_email", "==", email)
              );
              const refersSnapshot = await getDocs(refersQuery);

              if (!refersSnapshot.empty) {
                const referrerDoc = refersSnapshot.docs[0];
                const referrerData = referrerDoc.data() as DocumentData;
                const commission = (5 / 100) * usdAmount;
                await updateDoc(referrerDoc.ref, {
                  commission: (referrerData.commission || 0) + commission,
                });
              }

              setSuccess(
                `Payment successful! $${usdAmount.toFixed(
                  2
                )} has been added to your balance.`
              );
            } else {
              setError("Payment verification failed. Please contact support.");
              await recordFailedTransaction();
            }
          } catch (error) {
            console.error("Error verifying transaction:", error);
            setError(
              error instanceof Error
                ? error.message
                : "An error occurred during payment verification."
            );
            await recordFailedTransaction();
          } finally {
            setLoading(false);
          }
        },
        onclose: () => {
          setLoading(false);
          setError(
            "Payment window was closed. Please try again if you want to complete the payment."
          );
          recordPendingTransaction();
        },
      };

      // Enhanced mobile responsiveness
      paymentOptions.customizations.theme = {
        color: "#4F46E5", // Primary button color
        button_text: "#FFFFFF", // Button text color
        button_color: "#4F46E5", // Button background color
        background_color: "#F9FAFB", // Background color
        modal_color: "#FFFFFF", // Modal background color
        close_button_color: "#6B7280", // Close button color
        error_color: "#EF4444", // Error message color
        success_color: "#10B981", // Success message color
        text_color: "#111827", // Main text color
        link_color: "#4F46E5", // Link color
        header_text: "#111827", // Header text color
        footer_text: "#6B7280", // Footer text color
      };

      paymentOptions.display = {
        theme: "light",
        position: isMobile ? "center" : "right",
        floating: !isMobile,
        show_form: true,
        mobile_view: isMobile,
        ...paymentConfig?.display,
      };

      window.FlutterwaveCheckout(paymentOptions);
    } catch (error) {
      console.error("Error initiating payment:", error);
      setError("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const recordFailedTransaction = async () => {
    try {
      await addDoc(collection(db, "deposit_history"), {
        user_email: user?.email || "default@example.com",
        amount: usdAmount,
        original_amount: amount,
        original_currency: "NGN",
        exchange_rate: exchangeRate,
        date: new Date(),
        mode: "Flutterwave",
        status: "failed",
      });
    } catch (error) {
      console.error("Error recording failed transaction:", error);
    }
  };

  const recordPendingTransaction = async () => {
    try {
      await addDoc(collection(db, "deposit_history"), {
        user_email: user?.email || "default@example.com",
        amount: usdAmount,
        original_amount: amount,
        original_currency: "NGN",
        exchange_rate: exchangeRate,
        date: new Date(),
        mode: "Flutterwave",
        status: "pending",
      });
    } catch (error) {
      console.error("Error recording pending transaction:", error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatUsdCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const resetPaymentMethod = () => {
    setSelectedMethod(null);
    setAmount(null);
    setError(null);
    setSuccess(null);
    setUsdAmount(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold">
            Current Balance:{" "}
            <span className="text-blue-600">{formatUsdCurrency(balance)}</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.displayName || "User"}! Ready to make a
            deposit?
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>{success}</p>
        </div>
      )}

      {selectedMethod ? (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {selectedMethod === "flutterwave"
                ? "Card/Bank Payment"
                : "Crypto Payment"}
            </h3>
            <button
              onClick={resetPaymentMethod}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back
            </button>
          </div>

          {selectedMethod === "flutterwave" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to deposit (₦1,000 - ₦100,000)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  min="1000"
                  max="100000"
                  onChange={handleAmountChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum: ₦1,000 | Maximum: ₦100,000
                </p>

                {usdAmount && (
                  <div className="mt-2 p-2 bg-gray-100 rounded-md">
                    <p className="text-sm font-medium">
                      Equivalent:{" "}
                      <span className="text-blue-600">
                        {formatUsdCurrency(usdAmount)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This is the amount that will be added to your balance in
                      USD.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {[1000, 2000, 5000, 10000].map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setAmount(value);
                      setError(null);
                    }}
                    className={`p-2 border rounded-md text-center ${
                      amount === value
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    ₦{value.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleFlutterwavePayment}
                  disabled={!amount || loading}
                  className={`
                    w-full py-3 px-4 rounded-md text-white font-medium transition-all
                    ${
                      !amount || loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.01]"
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    active:scale-95
                    md:w-auto md:px-6 md:py-3
                  `}
                >
                  <span className="flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="hidden md:inline">
                          Proceed to Secure Payment
                        </span>
                        <span className="md:hidden">Pay Now</span>
                        <svg
                          className="ml-2 -mr-1 w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                <p className="text-sm">
                  You'll be redirected to Flutterwave's secure payment page to
                  complete your transaction.
                </p>
                {usdAmount && (
                  <p className="text-sm mt-1">
                    Your account will be credited with{" "}
                    {formatUsdCurrency(usdAmount)} after successful payment.
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedMethod === "Cryptocurrency" && <Crypto />}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Choose Payment Method
            </h3>
            <p className="text-gray-600 mt-1">
              Select your preferred payment option below
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() =>
                  handleTopUp(method.id as "flutterwave" | "Cryptocurrency")
                }
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Image
                      src={method.logo}
                      width={60}
                      height={60}
                      alt={method.name}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-500">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Payment Security</h4>
            <p className="text-sm text-gray-600">
              All transactions are secured with 256-bit SSL encryption. We don't
              store your payment details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBalance;
