/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";

const VerifyEmail = () => {
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailSentTime, setEmailSentTime] = useState<number | null>(null);
  const router = useRouter();

  // Check if user is already verified on component mount
  useEffect(() => {
    const checkInitialVerification = async () => {
      try {
        await auth.currentUser?.reload();
        if (auth.currentUser?.emailVerified) {
          setMessage({
            text: "Your email is already verified. Redirecting...",
            type: "success",
          });
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      } catch (error) {
        console.error("Initial verification check failed:", error);
      }
    };

    checkInitialVerification();
  }, [router]);

  // Handle countdown timer for email resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setMessage(null);

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setEmailSentTime(Date.now());
        setCountdown(60); // 1 minute cooldown
        setMessage({
          text: "Verification email resent. Please check your inbox (and spam folder).",
          type: "success",
        });
      }
    } catch (error: any) {
      console.error("Error resending email:", error);
      setMessage({
        text:
          error.message ||
          "Failed to resend verification email. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        setMessage({
          text: "Email verified successfully! Redirecting...",
          type: "success",
        });
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setMessage({
          text: "Not verified yet. Please check your email and click the verification link.",
          type: "info",
        });
      }
    } catch (error: any) {
      console.error("Verification check failed:", error);
      setMessage({
        text:
          error.message ||
          "Failed to check verification status. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMessageColor = () => {
    if (!message) return "";
    switch (message.type) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <FaEnvelope className="text-blue-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Verify Your Email
          </h1>
          <p className="text-center text-gray-600 mt-2">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-gray-800">
              {auth.currentUser?.email}
            </span>
            . Please click the link to complete your registration.
          </p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-3 rounded-lg border mb-4 text-sm ${getMessageColor()}`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleCheckVerification}
            disabled={loading}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white shadow-sm`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Checking...
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-2" />
                Check Verification Status
              </>
            )}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={loading || countdown > 0}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${
              loading || countdown > 0
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white shadow-sm`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend Verification Email"
            )}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Didn&apos;t receive the email? Check your spam folder or try
            resending.
          </p>
          <p className="mt-2">
            Having trouble?{" "}
            <a
              href="mailto:support@yourdomain.com"
              className="text-blue-500 hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
