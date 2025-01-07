"use client";

import React, { useState } from "react";
import { auth } from "../firebaseConfig"; // Ensure this path is correct
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app"; // Import FirebaseError for error typing

const SignIn = () => {
  const [email, setEmail] = useState<string>(""); // Specify string type
  const [password, setPassword] = useState<string>(""); // Specify string type
  const [error, setError] = useState<string>(""); // Specify string type
  const [loading, setLoading] = useState<boolean>(false); // Specify boolean type
  const [forgotPasswordMessage, setForgotPasswordMessage] =
    useState<string>(""); // Specify string type
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
        if (err.code === "auth/user-not-found") {
          setError("No user found with this email.");
        } else if (err.code === "auth/wrong-password") {
          setError("Incorrect password. Please try again.");
        } else {
          setError("An error occurred. Please try again.");
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <form onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white p-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-blue-500 text-sm hover:underline"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>
        {forgotPasswordMessage && (
          <p className="text-green-500 text-sm mt-2">{forgotPasswordMessage}</p>
        )}
        <p className="text-center mt-4 text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <span
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={() => router.push("/signup")}
          >
            Create new
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
