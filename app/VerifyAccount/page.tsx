"use client";
import React, { useEffect, useState } from "react";
import { sendEmailVerification, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../firebaseConfig";
import {
  FiMail,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";

const VerifyAccount: React.FC = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: User | null) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailSent && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emailSent, resendTimer]);

  const handleSendVerificationEmail = async () => {
    if (user) {
      try {
        setLoading(true);
        setError(null);
        await sendEmailVerification(user);
        setEmailSent(true);
        setLoading(false);
        setResendTimer(60); // Reset to 60 seconds
      } catch (err: unknown) {
        console.error("Error sending verification email:", err);
        setLoading(false);
        const errorObj = err as { code?: string };
        if (errorObj.code === "auth/too-many-requests") {
          setError("Too many requests. Please try again later.");
        } else {
          setError("Failed to send verification email. Please try again.");
        }
      }
    }
  };

  const handleCheckVerificationStatus = async () => {
    if (user) {
      try {
        setLoading(true);
        await user.reload();
        if (user.emailVerified) {
          router.push("/dashboard");
        } else {
          setError("Email not verified yet. Please check your inbox.");
        }
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error checking verification status:", err);
        setLoading(false);
        setError("Error checking verification status.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center justify-center">
            <FiMail className="text-3xl mr-3" />
            <h1 className="text-2xl font-bold">Verify Your Email</h1>
          </div>
        </div>

        <div className="p-6">
          {user && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  We&apos;ve sent a verification link to:
                </p>
                <p className="text-lg font-semibold text-indigo-600">
                  {user.email}
                </p>
              </div>

              {!emailSent ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendVerificationEmail}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    loading
                      ? "bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white flex items-center justify-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiMail className="mr-2" />
                      Send Verification Email
                    </>
                  )}
                </motion.button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                    <FiCheckCircle className="text-blue-500 text-xl mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-800">
                        Verification email sent!
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Check your inbox and click the link to verify your
                        account.
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckVerificationStatus}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      loading
                        ? "bg-green-400"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white flex items-center justify-center`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="animate-spin mr-2" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="mr-2" />
                        I&apos;ve Verified My Email
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center text-sm text-gray-500">
                    {resendTimer > 0 ? (
                      <div className="flex items-center">
                        <FiClock className="mr-1" />
                        <span>Resend in {resendTimer}s</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleSendVerificationEmail}
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                      >
                        <FiRefreshCw className="mr-1" />
                        Resend Verification Email
                      </button>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start"
                >
                  <FiAlertCircle className="text-red-500 text-xl mt-1 mr-3 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </motion.div>
              )}

              <div className="pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
                <p>
                  Having trouble? Check your spam folder or contact support.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyAccount;
