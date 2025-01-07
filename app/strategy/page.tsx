"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const StrategyPage = () => {
  return (
    <div className="w-[80%] m-auto py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Our Strategy for Success
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          At SmsGlobe, we provide innovative virtual verification solutions that
          are designed to meet the security needs of the digital world. Here's
          how our approach works to keep you safe and efficient.
        </p>
      </div>

      {/* Strategy Steps */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
        {/* Step 1 */}
        <div className="bg-white border rounded-lg p-8 text-center">
          <Image
            src="/images/strategy-step1.svg"
            alt="Step 1"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h2 className="text-2xl font-semibold text-gray-800 mt-6">
            Step 1: Secure Registration
          </h2>
          <p className="mt-4 text-gray-600">
            Sign up and receive immediate access to secure, temporary
            verification methods that ensure your identity is protected.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white border rounded-lg p-8 text-center">
          <Image
            src="/images/strategy-step2.svg"
            alt="Step 2"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h2 className="text-2xl font-semibold text-gray-800 mt-6">
            Step 2: Instant Verification
          </h2>
          <p className="mt-4 text-gray-600">
            Quickly verify your identity using our virtual methods that are
            simple and fast, saving you time and hassle.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white border rounded-lg p-8 text-center">
          <Image
            src="/images/strategy-step3.svg"
            alt="Step 3"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h2 className="text-2xl font-semibold text-gray-800 mt-6">
            Step 3: Ongoing Security
          </h2>
          <p className="mt-4 text-gray-600">
            Benefit from continuous protection with regular updates and enhanced
            features designed to keep your information safe.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-24 text-center">
        <h3 className="text-3xl font-semibold text-gray-800">
          Ready to Get Started?
        </h3>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Join SmsGlobe today and take the first step toward secure and
          efficient virtual verification. Experience how our platform can
          transform your security practices.
        </p>
        <Link
          href="/get-started"
          className="mt-6 inline-block bg-red-500 text-white py-3 px-6 rounded-full text-lg font-medium hover:bg-red-600 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default StrategyPage;
