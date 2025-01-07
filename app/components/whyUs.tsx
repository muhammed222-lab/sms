"use client";

import Head from "next/head";

export default function WhyChooseUs() {
  return (
    <>
      <Head>
        <title>Why Choose Us</title>
      </Head>
      <div className="py-12 px-4 ">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
            Why Choose Our Service?
          </h2>
          <div className="grid gap-8 mt-10 md:grid-cols-2">
            {/* Extended Number Validity */}
            <div className="flex">
              <span className="text-red-600 text-2xl font-bold mr-3">●</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Extended Number Validity
                </h3>
                <p className="text-gray-600 mt-2">
                  Enjoy extended validity for each number, allowing you to
                  receive codes and messages without interruptions.
                </p>
              </div>
            </div>

            {/* Multi-Platform Compatibility */}
            <div className="flex">
              <span className="text-red-600 text-2xl font-bold mr-3">●</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Multi-Platform Compatibility
                </h3>
                <p className="text-gray-600 mt-2">
                  Use one number for multiple platforms, such as Facebook,
                  WhatsApp, Telegram, and more.
                </p>
              </div>
            </div>

            {/* Flexible Currency Options */}
            <div className="flex">
              <span className="text-red-600 text-2xl font-bold mr-3">●</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Flexible Currency Options
                </h3>
                <p className="text-gray-600 mt-2">
                  Deposit in any currency, including Naira, and make payments
                  globally with real-time exchange rates.
                </p>
              </div>
            </div>

            {/* Secure Deposit System */}
            <div className="flex">
              <span className="text-red-600 text-2xl font-bold mr-3">●</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Secure Deposit System
                </h3>
                <p className="text-gray-600 mt-2">
                  Add funds to your account easily. Your balance is safely
                  stored and available for future use anytime.
                </p>
              </div>
            </div>

            {/* Real-Time SMS Reception */}
            <div className="flex">
              <span className="text-red-600 text-2xl font-bold mr-3">●</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Real-Time SMS Reception
                </h3>
                <p className="text-gray-600 mt-2">
                  Access received messages instantly on your dashboard. No
                  delays—get the codes you need in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
