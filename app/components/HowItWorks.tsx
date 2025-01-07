"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Import Firebase auth

export default function HowItWorks() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();

  // Monitor authentication state using Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user); // Set to true if the user is authenticated
    });
    return () => unsubscribe();
  }, []);

  const handleProceed = (step: string) => {
    if (!isSignedIn) {
      router.push("/signup"); // Redirect to signup if not signed in
      return;
    }

    switch (step) {
      case "signUp":
        router.push("/pricing"); // Redirect to pricing if signed in
        break;
      case "deposit":
        router.push("/deposit"); // Redirect to deposit if signed in
        break;
      case "generate":
        router.push("/dashboard"); // Redirect to dashboard if signed in
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mt-2 text-lg sm:text-xl">
            Your Privacy is Our Priority
          </p>
          <div className="flex flex-wrap justify-center mt-8 gap-8">
            {/* Step 1 */}
            <div className="relative bg-white rounded-lg border p-6 w-full sm:w-80 lg:w-1/3 border hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <div className="text-center">
                <i className="fas fa-user-plus text-5xl text-gray-700 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-800">
                  Sign Up & Choose Your Plan
                </h3>
                <p className="text-gray-600 mt-2">
                  Create an account and select a plan that suits your needs. We
                  offer flexible pricing and multiple currency options.
                </p>
                <button
                  className="mt-4 text-green-600 font-bold flex items-center justify-center hover:text-green-800"
                  onClick={() => handleProceed("signUp")}
                >
                  Proceed <i className="fas fa-arrow-circle-right ml-2"></i>
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white rounded-lg border p-6 w-full sm:w-80 lg:w-1/3 border hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <div className="text-center">
                <i className="fas fa-wallet text-5xl text-gray-700 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-800">
                  Deposit Funds
                </h3>
                <p className="text-gray-600 mt-2">
                  Top up your account in your preferred currency. Funds are
                  securely stored and ready to use whenever you need a number.
                </p>
                <button
                  className="mt-4 text-green-600 font-bold flex items-center justify-center hover:text-green-800"
                  onClick={() => handleProceed("deposit")}
                >
                  Proceed <i className="fas fa-arrow-circle-right ml-2"></i>
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white rounded-lg border p-6 w-full sm:w-80 lg:w-1/3 border hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <div className="text-center">
                <i className="fas fa-phone-alt text-5xl text-gray-700 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-800">
                  Generate a Temporary Number
                </h3>
                <p className="text-gray-600 mt-2">
                  Pick a number from our available list and start using it
                  immediately for SMS verifications.
                </p>
                <button
                  className="mt-4 text-green-600 font-bold flex items-center justify-center hover:text-green-800"
                  onClick={() => handleProceed("generate")}
                >
                  Proceed <i className="fas fa-arrow-circle-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
