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
import Image from "next/image";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

const SignUp = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  // Password validation checks
  const isPasswordValid = (password: string): boolean => {
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setLoading(false);
      return;
    }

    if (!isPasswordValid(password)) {
      setError(
        "Password must have at least 6 characters, a special character, a capital letter, and a number."
      );
      setLoading(false);
      return;
    }

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
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full max-w-md bg-white p-8 border rounded-lg">
        {/* Logo and Welcome Text */}
        <div className="text-center mb-6">
          <Image
            src="/deemax.png"
            alt="Sms Globe Logo"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h1 className="text-2xl font-bold mt-4">Welcome to Sms Globe</h1>
          <p className="text-gray-600">Create an account in just a minute!</p>
        </div>

        <form onSubmit={handleSignUp}>
          {/* First Name */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="First Name"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password with Toggle */}
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          {/* Confirm Password */}
          <div className="mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Password Validation Feedback */}
          <div className="mb-4 text-sm text-gray-600">
            <p>
              <span
                className={`${
                  isPasswordValid(password) ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPasswordValid(password) ? "✔" : "✘"}
              </span>{" "}
              Password must be at least 6 characters long, include a special
              character, a capital letter, and a number.
            </p>
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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Google Sign-In */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">OR</p>
          <button
            className="w-full flex items-center justify-center bg-red-500 text-white p-3 mt-2 rounded hover:bg-red-600"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FaGoogle className="mr-2" />
            Continue with Google
          </button>
        </div>

        {/* Sign In Redirect */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={() => router.push("/signin")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
