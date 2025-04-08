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
  };
  callback: (response: { transaction_id: string; status: string }) => void;
  onclose: () => void;
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

  // Load Flutterwave script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
        // Fallback rate if API fails
        setExchangeRate(1538.5); // Approximate rate as fallback
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
      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: transactionRef,
        amount: amount,
        currency: "NGN",
        payment_options: paymentMethods[0]?.supportedOptions?.join(",") ?? "",
        customer: {
          email: user?.email || "default@example.com",
          phone_number: user?.phoneNumber || "08012345678",
          name: user?.displayName || "Customer",
        },
        customizations: {
          title: "Top Up Balance",
          description: `Deposit ₦${amount.toLocaleString()} ($${usdAmount.toFixed(
            2
          )}) to your account`,
          logo: "/deemax.png",
        },
        callback: async (response) => {
          try {
            const verifyResponse = await fetch("/api/verify-transaction", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transactionId: response.transaction_id }),
            });

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
                flutterwave_data: transactionData, // Store the full response for reference
              });

              // Handle referral commission (in USD)
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
      });
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
              ← Back to payment methods
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
                  className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                    !amount || loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Processing..." : "Proceed to Payment"}
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
