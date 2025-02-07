"use client";

import React, { useState } from "react";
import { auth } from "../firebaseConfig"; // Ensure this path is correct
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignIn = () => {
  const [email, setEmail] = useState<string>(""); // Specify string type
  const [password, setPassword] = useState<string>(""); // Specify string type
  const [error, setError] = useState<string>(""); // Specify string type
  const [loading, setLoading] = useState<boolean>(false); // Specify boolean type
  const [forgotPasswordMessage, setForgotPasswordMessage] =
    useState<string>(""); // Specify string type
  const [showPassword, setShowPassword] = useState<boolean>(false); // Toggle for password visibility
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setForgotPasswordMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect to dashboard after successful login
    } catch (err) {
      setLoading(false);
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/user-not-found":
            setError("We couldn't find an account with this email address.");
            break;
          case "auth/wrong-password":
            setError(
              "The password you entered is incorrect. Please try again."
            );
            break;
          default:
            setError("Details not correct. Please try again later.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setError("");
    setForgotPasswordMessage("");

    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setForgotPasswordMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/user-not-found") {
          setError("No user found with this email.");
        } else {
          setError("Failed to send password reset email. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white p-8 border rounded-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <Image
            src="/deemax.png"
            alt="Deemax Logo"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h1 className="text-2xl font-bold mt-4">Welcome Back to Sms Globe</h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

        <form onSubmit={handleSignIn}>
          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-500" />
              ) : (
                <FaEye className="text-gray-500" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Forgot Password */}
        <div className="mt-4 text-center">
          <button
            className="text-blue-500 text-sm hover:underline"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>
        {forgotPasswordMessage && (
          <p className="text-green-500 text-sm mt-2 text-center">
            {forgotPasswordMessage}
          </p>
        )}

        {/* Sign Up Redirect */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <span
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={() => router.push("/signup")}
          >
            Create one now
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
