"use client";

import React, { useState } from "react";
import { auth, db } from "../firebaseConfig"; // Ensure this is your correct path
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update user profile with first name
      await updateProfile(userCredential.user, {
        displayName: firstName,
      });

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Add user data to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        first_name: firstName,
        email,
        currency: "ngn", // Example default value
        date: new Date().toISOString(),
        verified: false, // Optional: Track verification status
      });

      // Show success message and inform the user to verify their email
      alert(
        "Account created successfully! A verification email has been sent to your email address. Please verify your email to complete the registration."
      );

      // Optionally redirect to a 'Check Email' page
      router.push("/verify-email");
    } catch (err: any) {
      console.error("Sign-up error:", err);
      setLoading(false);

      // Handle Firebase errors
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please use a different email.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters long.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-2 mb-4 border rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white p-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={() => router.push("/signin")}
          >
            Sign In
          </span>
        </p>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">OR</p>
          <button className="w-full bg-red-500 text-white p-2 mt-2 rounded hover:bg-red-600">
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
