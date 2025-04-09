/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  runTransaction,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaGoogle, FaCheck, FaTimes } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<null | {
    name: string;
    email: string;
    code: string;
  }>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const router = useRouter();

  // Check for referrer details in local storage
  useEffect(() => {
    const referrerData = localStorage.getItem("referrer");
    if (referrerData) {
      try {
        setReferrer(JSON.parse(referrerData));
      } catch (e) {
        console.error("Error parsing referrer data", e);
      }
    }
  }, []);

  // Password validation checks
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  }, [password]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!recaptchaToken)
      newErrors.recaptcha = "Please verify you're not a robot";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Set persistence based on remember me
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: firstName,
      });

      await sendEmailVerification(userCredential.user);

      // Add user to 'users' collection
      await setDoc(doc(db, "users", userCredential.user.uid), {
        first_name: firstName,
        email,
        currency: "ngn",
        date: new Date().toISOString(),
        verified: false,
        balance: 0,
        referral_balance: 0,
      });

      // Add user to 'userDeposits' collection
      await addDoc(collection(db, "userDeposits"), {
        email,
        amount: 0.0,
        date: new Date().toISOString(),
      });

      // If referrer data exists, save to 'refers' collection and give bonus
      if (referrer) {
        await runTransaction(db, async (transaction) => {
          // Add referral record
          const referDocRef = await addDoc(collection(db, "refers"), {
            user_email: email,
            user_name: firstName,
            refer_by_email: referrer.email,
            refer_by_name: referrer.name,
            refer_date: new Date(),
            commission: 2, // $2 referral bonus
            status: "pending",
          });

          // Update referrer's balance
          const referrerDocRef = doc(db, "users", referrer.code); // Assuming referrer.code is their UID
          const referrerDoc = await transaction.get(referrerDocRef);

          if (referrerDoc.exists()) {
            const currentBalance = referrerDoc.data().referral_balance || 0;
            transaction.update(referrerDocRef, {
              referral_balance: currentBalance + 2,
            });
          }

          // Give new user a bonus
          const newUserDocRef = doc(db, "users", userCredential.user.uid);
          transaction.update(newUserDocRef, {
            balance: 2, // $2 signup bonus
          });
        });

        // Clear referrer from local storage
        localStorage.removeItem("referrer");
      }

      toast.success(
        "Account created successfully! Please check your email to verify your account.",
        {
          autoClose: 5000,
        }
      );

      router.push("/verify-email");
    } catch (err) {
      console.error("Signup error:", err);

      if (err instanceof FirebaseError) {
        let errorMessage = "An error occurred. Please try again.";

        switch (err.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already in use.";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address.";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Email/password accounts are not enabled.";
            break;
        }

        toast.error(errorMessage, { autoClose: 5000 });
      } else {
        toast.error("An unexpected error occurred.", { autoClose: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!recaptchaToken) {
      setErrors({ ...errors, recaptcha: "Please verify you're not a robot" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Set persistence based on remember me
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Add user to 'users' collection
      await setDoc(doc(db, "users", user.uid), {
        first_name: user.displayName,
        email: user.email,
        currency: "ngn",
        date: new Date().toISOString(),
        verified: user.emailVerified,
        balance: 0,
        referral_balance: 0,
      });

      // Add user to 'userDeposits' collection
      await addDoc(collection(db, "userDeposits"), {
        email: user.email,
        amount: 0.0,
        date: new Date().toISOString(),
      });

      // If referrer data exists, save to 'refers' collection and give bonus
      if (referrer && user.email) {
        await runTransaction(db, async (transaction) => {
          // Add referral record
          const referDocRef = await addDoc(collection(db, "refers"), {
            user_email: user.email,
            user_name: user.displayName,
            refer_by_email: referrer.email,
            refer_by_name: referrer.name,
            refer_date: new Date(),
            commission: 2, // $2 referral bonus
            status: "pending",
          });

          // Update referrer's balance
          const referrerDocRef = doc(db, "users", referrer.code);
          const referrerDoc = await transaction.get(referrerDocRef);

          if (referrerDoc.exists()) {
            const currentBalance = referrerDoc.data().referral_balance || 0;
            transaction.update(referrerDocRef, {
              referral_balance: currentBalance + 2,
            });
          }

          // Give new user a bonus
          const newUserDocRef = doc(db, "users", user.uid);
          transaction.update(newUserDocRef, {
            balance: 2, // $2 signup bonus
          });
        });

        // Clear referrer from local storage
        localStorage.removeItem("referrer");
      }

      toast.success("Successfully signed in with Google!", { autoClose: 3000 });
      router.push("/dashboard");
    } catch (err) {
      console.error("Google signin error:", err);

      if (err instanceof FirebaseError) {
        let errorMessage = "Failed to sign in with Google. Please try again.";

        if (err.code === "auth/account-exists-with-different-credential") {
          errorMessage =
            "An account already exists with this email. Please sign in with email/password.";
        }

        toast.error(errorMessage, { autoClose: 5000 });
      } else {
        toast.error("An unexpected error occurred.", { autoClose: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <ToastContainer position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl bg-white p-6 sm:p-8 rounded-2xl border w-[500px]"
      >
        {/* Your form or content here */}

        {/* Logo and Welcome Text */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Image
              src="/deemax.png"
              alt="Sms Globe Logo"
              width={80}
              height={80}
              className="rounded-lg"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold mt-4 text-gray-800">
            Welcome to Sms Globe
          </h1>
          <p className="text-gray-500 mt-1">
            Create your account to get started
          </p>

          {referrer && (
            <div className="mt-2 bg-blue-50 text-blue-700 p-2 rounded-md text-sm">
              You were referred by {referrer.name} - you&apos;ll get a $2 bonus!
            </div>
          )}
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="John cornel"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.firstName
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password with Toggle */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Password Validation */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <span
                className={`mr-2 ${
                  passwordValidation.length ? "text-green-500" : "text-gray-400"
                }`}
              >
                {passwordValidation.length ? <FaCheck /> : <FaTimes />}
              </span>
              <span>At least 6 characters</span>
            </div>
            <div className="flex items-center">
              <span
                className={`mr-2 ${
                  passwordValidation.uppercase
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {passwordValidation.uppercase ? <FaCheck /> : <FaTimes />}
              </span>
              <span>At least one uppercase letter</span>
            </div>
            <div className="flex items-center">
              <span
                className={`mr-2 ${
                  passwordValidation.lowercase
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {passwordValidation.lowercase ? <FaCheck /> : <FaTimes />}
              </span>
              <span>At least one lowercase letter</span>
            </div>
            <div className="flex items-center">
              <span
                className={`mr-2 ${
                  passwordValidation.number ? "text-green-500" : "text-gray-400"
                }`}
              >
                {passwordValidation.number ? <FaCheck /> : <FaTimes />}
              </span>
              <span>At least one number</span>
            </div>
            <div className="flex items-center">
              <span
                className={`mr-2 ${
                  passwordValidation.specialChar
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {passwordValidation.specialChar ? <FaCheck /> : <FaTimes />}
              </span>
              <span>At least one special character (@$!%*?&)</span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember me
            </label>
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={
                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "your-site-key"
              }
              onChange={(token: React.SetStateAction<string | null>) =>
                setRecaptchaToken(token)
              }
              onExpired={() => setRecaptchaToken(null)}
              onErrored={() => setRecaptchaToken(null)}
            />
          </div>
          {errors.recaptcha && (
            <p className="text-sm text-red-600 text-center">
              {errors.recaptcha}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Google Sign-In */}
        <button
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FaGoogle className="mr-3 text-red-500" />
          Continue with Google
        </button>

        {/* Sign In Redirect */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <button
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => router.push("/signin")}
            disabled={loading}
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
