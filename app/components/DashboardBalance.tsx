import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { auth, db } from "../firebaseConfig"; // Import Firebase Auth and Firestore
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const DashboardBalance: React.FC = () => {
  const [user, setUser] = useState<any>(null); // Firebase user state
  const [selectedMethod, setSelectedMethod] = useState<
    "flutterwave" | "bitcoin" | null
  >(null);
  const [amount, setAmount] = useState<number | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY;
  const [balance, setBalance] = useState<number>(0);
  const [convertedBalance, setConvertedBalance] = useState<number | null>(null);
  const [formattedBalance, setFormattedBalance] = useState<string>("");

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
    // Listen for user authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (user) {
        try {
          const email = user.email || "default@example.com"; // Firebase user's email
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
      alert("Please enter a valid amount between 5,000 and 100,000 Naira.");
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
        email: user?.email || "default@example.com", // Firebase user's email
        phone_number: user?.phoneNumber || "08012345678", // Firebase user's phone number (if available)
        name: user?.displayName || "John Doe", // Firebase user's display name
      },
      customizations: {
        title: "Top Up Balance",
        description: `Deposit ${amount} Naira to your account.`,
        logo: "/deemax.png", // Replace with your logo URL
      },
      callback: async (response: any) => {
        if (response.status === "successful") {
          alert("Payment successful!");
          setBalance((prevBalance) => prevBalance + amount); // Update balance
          setSelectedMethod(null); // Reset selection

          // Save or update user deposit in Firestore
          try {
            const email = user?.email || "default@example.com";
            const depositCollection = collection(db, "userDeposits");

            // Check if a user with the email already exists
            const userQuery = query(
              depositCollection,
              where("email", "==", email)
            );
            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
              const docRef = querySnapshot.docs[0].ref;
              const existingData = querySnapshot.docs[0].data();
              const newAmount = (existingData.amount || 0) + amount;

              await updateDoc(docRef, { amount: newAmount });
              console.log("User deposit updated!");
            } else {
              await addDoc(depositCollection, {
                email,
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

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>
          <span
            className={`text-sm ${
              balance === 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            Current Balance: ₦{balance.toLocaleString()}
          </span>
        </h2>
        <p>Hey, {user?.displayName || "User"}! Let's make a deposit.</p>
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
