"use client";

import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";

const SignUp = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: firstName,
      });

      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        first_name: firstName,
        email,
        currency: "ngn",
        date: new Date().toISOString(),
        verified: false,
      });

      alert(
        "Account created successfully! A verification email has been sent to your email address. Please verify your email to complete the registration."
      );

      router.push("/verify-email");
    } catch (err) {
      setLoading(false);

      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          setError(
            "This email is already in use. Please use a different email."
          );
        } else if (err.code === "auth/weak-password") {
          setError("Password should be at least 6 characters long.");
        } else {
          setError("An error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Add user data to Firestore (if necessary)
      await setDoc(doc(db, "users", user.uid), {
        first_name: user.displayName,
        email: user.email,
        currency: "ngn",
        date: new Date().toISOString(),
        verified: user.emailVerified,
      });

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError("Failed to sign in with Google. Please try again.");
      } else {
        setError("An unexpected error occurred.");
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
          <button
            className="w-full bg-red-500 text-white p-2 mt-2 rounded hover:bg-red-600"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
