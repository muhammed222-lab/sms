/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-undef */
// components/rent/RentNumbers.tsx
"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import CountrySelector from "./rent/CountrySelector";
import OperatorSelector from "./rent/OperatorSelector";
import ProductSelector from "./rent/ProductSelector";
import { DurationSelector } from "./rent/DurationSelector";
import ActiveOrders from "./rent/ActiveOrders";
import OrderList from "./rent/OrderList";
import OrderDetail from "./rent/OrderDetail";
import { ExchangeRateService } from "./rent/ExchangeRateService";
import RentForm from "./rent/RentForm";
import { OrdersTab } from "./rent/OrdersTab";

const RentNumbers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"rent" | "orders">("rent");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [rubleToUSDRate, setRubleToUSDRate] = useState<number>(0.011);
  const [message, setMessage] = useState<string>("");

  // Load user data and exchange rate
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        setUserEmail(user.email);
        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setBalance(querySnapshot.docs[0].data().amount || 0);
        }
      }
    });

    // Load exchange rate
    ExchangeRateService.getRUBToUSDRate().then(setRubleToUSDRate);

    return () => unsubscribe();
  }, []);

  function fetchOrders(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Number Rental</h1>
          <p className="mt-2">Temporary numbers for verification</p>

          <div className="mt-4 flex justify-between items-center">
            <div className="bg-blue-700 px-4 py-2 rounded-lg">
              <span className="font-medium">Balance:</span> $
              {balance.toFixed(2)}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("rent")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "rent"
                    ? "bg-white text-blue-800"
                    : "bg-blue-700"
                }`}
              >
                Rent Number
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "orders"
                    ? "bg-white text-blue-800"
                    : "bg-blue-700"
                }`}
              >
                My Orders
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.includes("Success")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {activeTab === "rent" ? (
            <RentForm
              userEmail={userEmail}
              balance={balance}
              rubleToUSDRate={rubleToUSDRate}
              setMessage={setMessage}
              setBalance={setBalance}
              setActiveOrders={(orders) => {
                console.log("Active orders updated:", orders);
              }}
              fetchOrders={fetchOrders}
            />
          ) : (
            <OrdersTab
              userEmail={userEmail || ""}
              rubleToUSDRate={rubleToUSDRate}
              balance={balance}
              setMessage={setMessage}
              setBalance={setBalance}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RentNumbers;
