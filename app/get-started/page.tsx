import React from "react";
import Link from "next/link";
import Header from "../components/header";
const GetStarted = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 text-white">
            <h1 className="text-3xl md:text-5xl font-bold">
              Get Started with SmsGlobe
            </h1>
            <p className="mt-4 text-lg md:text-xl">
              Experience seamless virtual verification solutions. Your privacy,
              convenience, and security are just a few steps away!
            </p>
          </div>

          {/* Steps Section */}
          <div className="p-8 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Follow These Simple Steps
            </h2>

            {/* Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500 text-white flex items-center justify-center rounded-full text-3xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-800">Sign Up</h3>
                <p className="text-gray-600 mt-2">
                  Create your free account to get started. It&apos;s quick and
                  easy!
                </p>
                <Link
                  href="/signup"
                  className="inline-block mt-4 text-red-500 font-medium hover:underline"
                >
                  Sign Up Now
                </Link>
              </div>

              {/* Step 2 */}
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500 text-white flex items-center justify-center rounded-full text-3xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Choose Your Plan
                </h3>
                <p className="text-gray-600 mt-2">
                  Pick a subscription plan that suits your needs and budget.
                </p>
                <Link
                  href="/services"
                  className="inline-block mt-4 text-red-500 font-medium hover:underline"
                >
                  View Pricing
                </Link>
              </div>

              {/* Step 3 */}
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500 text-white flex items-center justify-center rounded-full text-3xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Start Using Numbers
                </h3>
                <p className="text-gray-600 mt-2">
                  Generate virtual phone numbers and start verifying instantly.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block mt-4 text-red-500 font-medium hover:underline"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="bg-gray-100 p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800">
              Ready to Experience Hassle-Free Verification?
            </h3>
            <p className="text-gray-600 mt-2">
              Sign up today and take the first step towards secure online
              verification.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-red-500 text-white px-8 py-3 rounded-full text-lg font-medium mt-4 hover:bg-red-600 transition"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default GetStarted;
