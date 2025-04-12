"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaHome,
  FaGift,
  FaUserFriends,
  FaCheck,
} from "react-icons/fa";
import { FiLoader } from "react-icons/fi";

const InvitePage: React.FC = () => {
  const router = useRouter();
  const [inviter, setInviter] = useState<{
    name: string;
    email: string;
    referralCode: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInviter = async () => {
      setIsLoading(true);
      // Extract referral code from the URL path
      const referralCode = window.location.pathname.split("/").pop();
      if (!referralCode) {
        setError("No referral code found in the URL.");
        setIsLoading(false);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviter();
  }, []);

  const handleContinue = () => {
    router.push("/signup");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
        >
          <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
            <FaUserFriends className="text-red-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <p className="text-gray-600 mb-6">
            The referral link you used doesn&apos;t seem to be valid. Please
            check the link or ask your friend to resend it.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center justify-center w-full hover:bg-indigo-700 transition-colors"
          >
            <FaHome className="mr-2" />
            Go Back to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full"
      >
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="bg-white bg-opacity-20 p-4 rounded-full inline-flex mb-4">
            <FaGift className="text-3xl" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {inviter
              ? `🎉 You've been invited!`
              : "Checking your invitation..."}
          </h1>
          <p className="text-indigo-100">
            {inviter
              ? `By ${inviter.name}`
              : "Please wait while we verify your invite"}
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FiLoader className="animate-spin text-indigo-600 text-3xl mb-4" />
              <p className="text-gray-600">Verifying your invitation...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                    <FaCheck className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Exclusive Bonus
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Get $2.00 free credit on your first deposit
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                    <FaUserFriends className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Friend Benefits
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Your friend {inviter?.name} will also receive a bonus
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg flex items-center justify-center w-full hover:shadow-md transition-all"
              >
                Continue to Sign Up
                <FaArrowRight className="ml-2" />
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InvitePage;
