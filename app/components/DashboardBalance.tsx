/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { useUser } from "@clerk/nextjs"; // Import Clerk hook
import { db } from "../firebaseConfig"; // Import Firestore configuration

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore"; // Firestore functions

const DashboardBalance: React.FC = () => {
  const { user } = useUser(); // Retrieve logged-in user data
  const [selectedMethod, setSelectedMethod] = useState<
    "flutterwave" | "bitcoin" | null
  >(null);
  const [amount, setAmount] = useState<number | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY;
  const [balance, setBalance] = useState<number>(0);
  const [convertedBalance, setConvertedBalance] = useState<number | null>(null);
  const [formattedBalance, setFormattedBalance] = useState<string>("");
  const [currency] = useState<string>("NGN"); // Define currency state

  useEffect(() => {
    // Load the Flutterwave script
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (user) {
        try {
          const email =
            user.emailAddresses[0]?.emailAddress || "default@example.com";
          const q = query(
            collection(db, "userDeposits"),
            where("email", "==", email)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
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

    // Flutterwave Checkout
    (window as any).FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: `TX-${Date.now()}`,
      amount: amount,
      currency: "NGN",
      payment_options: "card,banktransfer",
      customer: {
        email: user?.emailAddresses[0]?.emailAddress || "default@example.com", // Use Clerk user email
        phone_number: user?.phoneNumbers?.[0]?.phoneNumber || "08012345678", // Use Clerk phone (optional)
        name: `${user?.firstName || "John"} ${user?.lastName || "Doe"}`, // Use Clerk name
      },
      customizations: {
        title: "Top Up Balance",
        description: `Deposit ${amount} Naira to your account.`,
        logo: "/deemax.png", // Replace with your logo URL
      },
      callback: async (response: any) => {
        // Handle payment response
        if (response.status === "successful") {
          alert("Payment successful!");
          setBalance((prevBalance) => prevBalance + amount); // Update balance
          setSelectedMethod(null); // Reset selection

          // Save or update user deposit in Firestore
          try {
            const email =
              user?.emailAddresses[0]?.emailAddress || "default@example.com";
            const name = `${user?.firstName || "John"} ${
              user?.lastName || "Doe"
            }`;

            const depositCollection = collection(db, "userDeposits");

            // Check if a user with the email already exists
            const userQuery = query(
              depositCollection,
              where("email", "==", email)
            );
            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
              // Update existing user's amount
              const docRef = querySnapshot.docs[0].ref;
              const existingData = querySnapshot.docs[0].data();
              const newAmount = (existingData.amount || 0) + amount;

              await updateDoc(docRef, { amount: newAmount });
              console.log("User deposit updated!");
            } else {
              // Add a new user record
              await addDoc(depositCollection, {
                email,
                name,
                amount,
                date: new Date().toISOString(),
              });
              console.log("New user deposit saved!");
            }
          } catch (error) {
            console.error("Error saving transaction: ", error);
          }
        } else {
          alert("Payment failed. Please try again.");
        }
      },
      onclose: () => {
        alert("Payment window closed.");
      },
    });
  };

  useEffect(() => {
    const convertCurrency = async () => {
      if (!currency || currency === "N/A" || balance === 0) {
        setConvertedBalance(balance);
        setFormattedBalance(
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
          }).format(balance)
        );
        return;
      }

      try {
        const response = await fetch(
          `https://api.exchangerate.host/convert?from=NGN&to=${currency}&amount=${balance}`
        );
        const data = await response.json();

        if (data.result) {
          setConvertedBalance(data.result);
          setFormattedBalance(
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currency,
            }).format(data.result)
          );
        } else {
          setConvertedBalance(balance);
          setFormattedBalance(
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "NGN",
            }).format(balance)
          );
        }
      } catch (error) {
        console.error("Error converting currency:", error);
        setConvertedBalance(balance);
        setFormattedBalance(
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
          }).format(balance)
        );
      }
    };

    convertCurrency();
  }, [currency, balance]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>
          <h3>
            <span
              className={`text-sm ${
                convertedBalance === 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              Current Balance:{" "}
              {formattedBalance !== "" ? formattedBalance : "Loading..."}
            </span>
          </h3>
        </h2>
        <p>Hey, {user?.firstName || "User"}! Let&apos;s make a deposit.</p>
      </div>

      {selectedMethod ? (
        <div>
          <h3>
            You selected:{" "}
            {selectedMethod === "flutterwave" ? "Flutterwave" : "Bitcoin"}
          </h3>
          {selectedMethod === "flutterwave" && (
            <div>
              <p>
                Enter the amount to deposit (Minimum: ₦1,000, Maximum:
                ₦100,000):
              </p>
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
              {amount && (
                <p style={{ color: "green" }}>
                  You entered: ₦{amount}. Click proceed to complete payment.
                </p>
              )}
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
                border:
                  selectedMethod === "flutterwave"
                    ? "2px solid green"
                    : "1px solid gray",
                borderRadius: "8px",
                backgroundColor: "white",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {selectedMethod === "flutterwave" && (
                <FaCheckCircle
                  style={{
                    color: "green",
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                  }}
                />
              )}
              <Image
                src="/flutter.png"
                width={200}
                height={100}
                alt="Flutterwave"
              />
            </button>
            <button
              onClick={() => handleTopUp("bitcoin")}
              style={{
                padding: "10px",
                border:
                  selectedMethod === "bitcoin"
                    ? "2px solid green"
                    : "1px solid gray",
                borderRadius: "8px",
                backgroundColor: "white",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {selectedMethod === "bitcoin" && (
                <FaCheckCircle
                  style={{
                    color: "green",
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                  }}
                />
              )}
              <Image src="/bitcoin.png" width={50} height={50} alt="Bitcoin" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBalance;
