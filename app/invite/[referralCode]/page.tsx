"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const InvitePage: React.FC = () => {
  const router = useRouter();
  const [inviter, setInviter] = useState<{
    name: string;
    email: string;
    referralCode: string;
  } | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchInviter = async () => {
      // Extract referral code from the URL path
      const referralCode = window.location.pathname.split("/").pop();
      if (!referralCode) {
        setError("No referral code found in the URL.");
        return;
      }

      try {
        // Query Firestore for the user with the referral code
        const usersCollection = collection(db, "users");
        const q = query(
          usersCollection,
          where("referral_code", "==", referralCode)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const inviterData = querySnapshot.docs[0].data();
          setInviter({
            name: inviterData?.first_name || "Someone",
            email: inviterData?.email || "",
            referralCode,
          });

          // Save inviter details to local storage
          localStorage.setItem(
            "referrer",
            JSON.stringify({
              name: inviterData?.first_name,
              email: inviterData?.email,
              referralCode,
            })
          );
        } else {
          setError("Invalid referral code.");
        }
      } catch (err) {
        console.error("Error fetching inviter:", err);
        setError("Something went wrong. Please try again later.");
      }
    };

    fetchInviter();
  }, []);

  const handleContinue = () => {
    router.push("/signup");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-xl font-bold text-red-600 mb-4">{error}</h1>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        {inviter
          ? `You were invited by ${inviter.name}!`
          : "Checking referral details..."}
      </h1>
      <p className="text-gray-600 mb-6">
        {inviter
          ? "Join us now and get free N2,000 on your first deposit!"
          : ""}
      </p>
      <button
        onClick={handleContinue}
        className="bg-blue-500 text-white px-6 py-3 rounded"
      >
        Continue to Signup
      </button>
    </div>
  );
};

export default InvitePage;
