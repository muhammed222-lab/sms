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
  doc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

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
  callback: (response: { transaction_id: any; status: string }) => void;
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
    "flutterwave" | "bitcoin" | null
  >(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const publicKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
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

  const handleTopUp = (method: "flutterwave" | "bitcoin") => {
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

    const transactionRef = `TX-${Date.now()}`; // Generate a unique transaction reference

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
        // After the Flutterwave checkout, verify the transaction
        try {
          const verifyResponse = await fetch("/api/verify-transaction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
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

            // Update the user's balance in Firestore
            const email = user?.email || "default@example.com";
            const depositCollection = collection(db, "userDeposits");

            const userQuery = query(
              depositCollection,
              where("email", "==", email)
            );
            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
              // Update the existing document
              const docRef = querySnapshot.docs[0].ref;
              const existingData = querySnapshot.docs[0].data() as DocumentData;
              const newAmount = (existingData.amount || 0) + amount;

              await updateDoc(docRef, { amount: newAmount });
            } else {
              // Create a new document if not found
              await addDoc(depositCollection, {
                email,
                amount,
                date: new Date().toISOString(),
              });
            }

            // Update UI balance
            setBalance((prevBalance) => prevBalance + amount);
          } else {
            alert("Payment verification failed. Please try again.");
          }
        } catch (error) {
          console.error("Error verifying transaction:", error);
          alert("An error occurred during payment verification.");
        }
      },
      onclose: () => {
        alert("Payment window closed.");
      },
    });
  };

  const handleReferralCommission = async (
    email: string,
    depositAmount: number
  ) => {
    try {
      const q = query(
        collection(db, "refers"),
        where("user_email", "==", email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const referralDoc = querySnapshot.docs[0];
        const referralData = referralDoc.data();

        if (referralData?.bonus_applied && balance <= 2000) {
          const commission = depositAmount * 0.05; // 5% commission
          const referralRef = doc(db, "refers", referralDoc.id);

          await updateDoc(referralRef, {
            commission: commission,
          });

          console.log(
            `Commission of ${commission} NGN applied for referrer of ${email}`
          );
        }
      }
    } catch (error) {
      console.error("Error handling referral commission:", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>
          Current Balance: <strong>{balance} NGN</strong>
        </h2>
        <p>Hey, {user?.displayName || "User"}! Let&apos;s make a deposit.</p>
      </div>

      {selectedMethod ? (
        <div>
          <h3>
            You selected:{" "}
            {selectedMethod === "flutterwave" ? "Flutterwave" : "Bitcoin"}
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
              <button
                onClick={handleFlutterwavePayment}
                disabled={!amount}
                style={{
                  padding: "10px 20px",
                  backgroundColor: amount ? "#4CAF50" : "gray",
                  color: "white",
                  border: "none",
                  cursor: amount ? "pointer" : "not-allowed",
                  marginTop: "10px",
                  borderRadius: "5px",
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
                  marginLeft: "10px",
                  borderRadius: "5px",
                }}
              >
                Back
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Choose a Top-Up Method</h3>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <button
              onClick={() => handleTopUp("flutterwave")}
              style={{
                padding: "10px",
                border: "1px solid gray",
                borderRadius: "8px",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <Image
                src="/flutter.png"
                width={200}
                height={100}
                alt="Flutterwave"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBalance;
