/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-undef */
import React, { useState, useEffect } from "react";
import ReactSelect from "react-select";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiLock,
  FiArrowRight,
  FiExternalLink,
  FiInfo,
} from "react-icons/fi";

const CryptoPayment: React.FC = () => {
  const [amount, setAmount] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<any>({
    value: "USD",
    label: "USD",
  });
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    setCurrencies([{ value: "USD", label: "USD" }]);
    setSelectedCurrency({ value: "USD", label: "USD" });
    fetchCurrencies();

    return () => unsubscribe();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();
      const additionalCurrencies = Object.keys(data.rates)
        .filter((currency) => currency !== "USD")
        .map((currency) => ({
          value: currency,
          label: currency,
        }));
      setCurrencies((prev) => [...prev, ...additionalCurrencies]);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setError(null);
      setAmount(null);
      setConvertedAmount(null);
      return;
    }

    if (value < 1) {
      setError("Minimum amount is $1 USD or equivalent");
      setAmount(null);
      setConvertedAmount(null);
    } else {
      setError(null);
      setAmount(value);
      convertAmount(value, selectedCurrency.value);
    }
  };

  const handleCurrencyChange = (selectedOption: any) => {
    setSelectedCurrency(selectedOption);
    if (amount) {
      convertAmount(amount, selectedOption.value);
    }
  };

  const convertAmount = async (amount: number, currency: string) => {
    if (currency === "USD") {
      setConvertedAmount(amount);
      return;
    }

    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      const data = await response.json();
      const exchangeRate = data.rates[currency];
      if (exchangeRate) {
        const converted = amount / exchangeRate;
        setConvertedAmount(converted);
      } else {
        setError("Unable to convert currency");
        setConvertedAmount(null);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setError("Error converting currency");
      setConvertedAmount(null);
    }
  };

  const verifyPaymentWithCryptomus = async (orderId: string) => {
    try {
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      return null;
    }
  };

  const handlePayment = async () => {
    if (!amount || !selectedCurrency || !user?.email) return;

    const amountInUSD = convertedAmount || amount;
    if (amountInUSD < 1) {
      setError("Amount must be at least $1 USD after conversion");
      return;
    }

    setPaymentStatus("processing");
    setLoading(true);

    try {
      const response = await fetch("/api/proxy-btc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInUSD.toFixed(2),
          currency: selectedCurrency.value,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.data.result.url) {
        throw new Error(data.error || "Payment initiation failed");
      }

      // Save transaction to Firestore as pending
      const transactionData = {
        userId: user.uid,
        userEmail: user.email,
        amount: amountInUSD,
        currency: selectedCurrency.value,
        originalAmount: amount,
        originalCurrency: selectedCurrency.value,
        status: "pending",
        paymentUrl: data.data.result.url,
        orderId: data.data.result.order_id,
        createdAt: new Date().toISOString(),
        cryptoAddress: data.data.result.address,
        expiration: data.data.result.expired_at,
      };

      await addDoc(collection(db, "crypto_payments"), transactionData);

      // Set payment URL but don't redirect automatically
      setPaymentUrl(data.data.result.url);
      setPaymentStatus("success");
    } catch (error) {
      console.error("Payment error:", error);
      setError(error instanceof Error ? error.message : "Payment failed");
      setPaymentStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Check for completed payments
  useEffect(() => {
    if (!user?.email) return;

    const checkPendingPayments = async () => {
      try {
        const q = query(
          collection(db, "crypto_payments"),
          where("userEmail", "==", user.email),
          where("status", "==", "pending")
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return;

        for (const doc of querySnapshot.docs) {
          const paymentData = doc.data();

          // Verify payment status with Cryptomus
          const verification = await verifyPaymentWithCryptomus(
            paymentData.orderId
          );

          if (
            verification?.result?.payment_status === "paid" ||
            verification?.result?.payment_status === "paid_over"
          ) {
            // Update payment status in Firestore
            await updateDoc(doc.ref, {
              status: "completed",
              verifiedAt: new Date().toISOString(),
              paymentStatus: verification.result.payment_status,
              txid: verification.result.txid,
            });

            // Update user balance
            const userDepositQuery = query(
              collection(db, "userDeposits"),
              where("email", "==", user.email)
            );
            const depositSnapshot = await getDocs(userDepositQuery);

            if (!depositSnapshot.empty) {
              const depositDoc = depositSnapshot.docs[0];
              const currentBalance = depositDoc.data().amount || 0;
              const newBalance = currentBalance + paymentData.amount;
              await updateDoc(depositDoc.ref, { amount: newBalance });
            }
          } else if (
            verification?.result?.payment_status === "cancel" ||
            verification?.result?.payment_status === "fail"
          ) {
            // Mark as failed if payment was cancelled or failed
            await updateDoc(doc.ref, {
              status: "failed",
              paymentStatus: verification.result.payment_status,
            });
          }
        }
      } catch (error) {
        console.error("Error checking payments:", error);
      }
    };

    const interval = setInterval(checkPendingPayments, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="max-w-md mx-auto rounded-lg">
      <div className="flex items-center mb-6">
        <FiLock className="text-green-500 mr-2 text-2xl" />
        <h2 className="text-2xl font-bold text-gray-800">
          Secure Crypto Payment
        </h2>
      </div>

      {paymentStatus === "success" && paymentUrl ? (
        <div className="text-center">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
            <FiCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Payment Ready
            </h3>
            <p className="text-green-600 mb-4">
              Please complete your payment on the next page. Your balance will
              be updated after we verify the transaction.
            </p>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-white"
            >
              Continue to Payment <FiExternalLink className="ml-2" />
            </a>
            <button
              onClick={() => {
                setPaymentStatus("idle");
                setPaymentUrl(null);
              }}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel and return
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>
              Having issues? The payment link will remain valid for 30 minutes.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <FiInfo className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Payment Information</p>
                <p className="text-sm text-blue-600">
                  All amounts are converted to USD. Minimum deposit is $1. Your
                  balance will only be updated after we verify your payment.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Deposit
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter amount"
                  onChange={handleAmountChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="5"
                  step="0.01"
                />
                {selectedCurrency && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">
                      {selectedCurrency.label}
                    </span>
                  </div>
                )}
              </div>
              {error && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <FiAlertTriangle className="mr-1" />
                  {error}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <ReactSelect
                options={currencies}
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select currency"
                isSearchable
              />
            </div>

            {convertedAmount !== null && selectedCurrency.value !== "USD" && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  ≈ {convertedAmount.toFixed(2)} USD
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handlePayment}
                disabled={!amount || loading || !!error}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white ${
                  !amount || loading || error
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
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
                    Continue to Payment <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Payment Security
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <FiCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>All transactions are encrypted and secure</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Balance only updates after payment verification</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  We verify all payments with Cryptomus before processing
                </span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default CryptoPayment;
