"use client";

import React, { useState } from "react";
import { auth } from "../firebaseConfig"; // Ensure this is your correct path
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";

const VerifyEmail = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMessage(
          "A verification email has been resent. Please check your inbox."
        );
      }
    } catch (error) {
      console.error("Error resending email:", error);
      setMessage(
        "An error occurred while resending the email. Please try again."
      );
    }

    setLoading(false);
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        setMessage("Your email has been successfully verified!");
        setTimeout(() => {
          router.push("/dashboard"); // Redirect to the dashboard after successful verification
        }, 2000);
      } else {
        setMessage("Your email is not yet verified. Please check your inbox.");
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      setMessage("An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Verify Your Email
        </h1>
        <p className="text-center text-gray-600 mb-4">
          A verification email has been sent to your registered email address.
          Please check your inbox (or spam folder) and follow the link to verify
          your email.
        </p>
        {message && <p className="text-center text-sm mb-4">{message}</p>}
        <button
          onClick={handleCheckVerification}
          className={`w-full bg-green-500 text-white p-2 rounded mb-4 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading
            ? "Checking Verification Status..."
            : "Check Verification Status"}
        </button>
        <button
          onClick={handleResendEmail}
          className={`w-full bg-blue-500 text-white p-2 rounded ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Resending Email..." : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
