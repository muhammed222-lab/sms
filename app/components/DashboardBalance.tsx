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
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const publicKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "";

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

  // Listen for window resize to adjust layout
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
        }
      }
    };

    fetchUserBalance();
  }, [user]);

  const handleTopUp = (method: "flutterwave" | "Cryptocurrency") => {
    setSelectedMethod(method);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1000 && value <= 100000) {
      setAmount(value);
    } else {
      setAmount(null);
    }
  };

  const handleFlutterwavePayment = async () => {
    if (!amount) {
      alert("Please enter a valid amount between 1,000 and 100,000 Naira.");
      return;
    }
    const transactionRef = `TX-${Date.now()}`;
    window.FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: transactionRef,
      amount: amount,
      currency: "NGN",
      payment_options: "card,banktransfer",
      customer: {
        email: user?.email || "default@example.com",
        phone_number: user?.phoneNumber || "08012345678",
        name: user?.displayName || "John Doe",
      },
      customizations: {
        title: "Top Up Balance",
        description: `Deposit ${amount} Naira to your account.`,
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
          if (
            verifyData.status === "success" &&
            verifyData.data.status === "successful" &&
            verifyData.data.amount === amount &&
            verifyData.data.currency === "NGN"
          ) {
            alert("Payment verified successfully!");
            const email = user?.email || "default@example.com";
            const depositCollection = collection(db, "userDeposits");
            const userQuery = query(
              depositCollection,
              where("email", "==", email)
            );
            const querySnapshot = await getDocs(userQuery);
            if (!querySnapshot.empty) {
              const docRef = querySnapshot.docs[0].ref;
              const existingData = querySnapshot.docs[0].data() as DocumentData;
              const newAmount = (existingData.amount || 0) + amount;
              await updateDoc(docRef, { amount: newAmount });
            } else {
              await addDoc(depositCollection, {
                email,
                amount,
                date: new Date().toISOString(),
              });
            }
            setBalance((prevBalance) => prevBalance + amount);
            const depositHistoryCollection = collection(db, "deposit_history");
            await addDoc(depositHistoryCollection, {
              user_email: email,
              amount,
              date: new Date(),
              mode: "Flutterwave",
              status: "success",
            });
            // Check referral commission
            const refersQuery = query(
              collection(db, "refers"),
              where("user_email", "==", email)
            );
            const refersSnapshot = await getDocs(refersQuery);
            if (!refersSnapshot.empty) {
              const referrerDoc = refersSnapshot.docs[0];
              const referrerData = referrerDoc.data() as DocumentData;
              const referrerEmail = referrerData.refer_by_email;
              const referrerCommission = referrerData.commission || 0;
              const commission = (5 / 100) * amount;
              await updateDoc(referrerDoc.ref, {
                commission: referrerCommission + commission,
              });
              console.log(
                `Commission of ${commission} added to referrer: ${referrerEmail}`
              );
            }
          } else {
            alert("Payment verification failed. Please try again.");
            const depositHistoryCollection = collection(db, "deposit_history");
            await addDoc(depositHistoryCollection, {
              user_email: user?.email || "default@example.com",
              amount,
              date: new Date(),
              mode: "Flutterwave",
              status: "failed",
            });
          }
        } catch (error) {
          console.error("Error verifying transaction:", error);
          alert("An error occurred during payment verification.");
          const depositHistoryCollection = collection(db, "deposit_history");
          await addDoc(depositHistoryCollection, {
            user_email: user?.email || "default@example.com",
            amount,
            date: new Date(),
            mode: "Flutterwave",
            status: "failed",
          });
        }
      },
      onclose: () => {
        alert("Payment window closed.");
        const depositHistoryCollection = collection(db, "deposit_history");
        addDoc(depositHistoryCollection, {
          user_email: user?.email || "default@example.com",
          amount,
          date: new Date(),
          mode: "Flutterwave",
          status: "pending",
        });
      },
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Determine flex direction based on window width (column for mobile)
  const methodContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: windowWidth < 768 ? "column" : "row",
    gap: "20px",
    alignItems: "center",
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>
          Current Balance: <strong>{formatCurrency(balance)}</strong>
        </h2>
        <p>Hey, {user?.displayName || "User"}! Let&apos;s make a deposit.</p>
      </div>

      {selectedMethod ? (
        <div>
          <h3>
            You selected:{" "}
            {selectedMethod === "flutterwave"
              ? "Flutterwave"
              : "Cryptocurrency"}
          </h3>
          {selectedMethod === "flutterwave" && (
            <div>
              <p>Enter the amount to deposit (₦1,000 - ₦100,000):</p>
              <input
                type="number"
                placeholder="Enter amount"
                onChange={handleAmountChange}
                style={{
                  padding: "10px",
                  marginTop: "10px",
                  marginBottom: "10px",
                  width: "200px",
                  border: "1px solid gray",
                  borderRadius: "5px",
                }}
              />
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={handleFlutterwavePayment}
                  disabled={!amount}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: amount ? "#4CAF50" : "gray",
                    color: "white",
                    border: "none",
                    cursor: amount ? "pointer" : "not-allowed",
                    borderRadius: "5px",
                    width: windowWidth < 768 ? "100%" : "auto",
                  }}
                >
                  Proceed
                </button>
                <button
                  onClick={() => setSelectedMethod(null)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: windowWidth < 768 ? "0" : "10px",
                    marginTop: windowWidth < 768 ? "10px" : "0",
                    borderRadius: "5px",
                    width: windowWidth < 768 ? "100%" : "auto",
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          )}
          {selectedMethod === "Cryptocurrency" && <Crypto />}
        </div>
      ) : (
        <div>
          <h3>Choose a Top-Up Method</h3>
          <div style={methodContainerStyle}>
            <button
              onClick={() => handleTopUp("flutterwave")}
              style={{
                padding: "10px",
                border: "1px solid gray",
                borderRadius: "8px",
                backgroundColor: "white",
                cursor: "pointer",
                width: windowWidth < 768 ? "100%" : "auto",
              }}
            >
              <Image
                src="/flutter.png"
                width={200}
                height={100}
                alt="Flutterwave"
              />
            </button>
            <button
              onClick={() => handleTopUp("Cryptocurrency")}
              style={{
                padding: "10px",
                border: "1px solid gray",
                borderRadius: "8px",
                backgroundColor: "white",
                cursor: "pointer",
                width: windowWidth < 768 ? "100%" : "auto",
              }}
            >
              <Image
                src="/bitcoin.png"
                width={200}
                height={50}
                alt="Cryptocurrency"
                className="rounded"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBalance;
// export { DashboardBalance };
// export type { FlutterwaveCheckoutOptions };
