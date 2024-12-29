"use client";

import Head from "next/head";

export default function PricingSection() {
  return (
    <>
      <Head>
        <title>Pricing</title>
      </Head>
      <div className="py-12 px-4 ">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Pricing
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mt-2">
            Affordable & Flexible Plans
          </p>
          <p className="text-gray-600 mt-4">
            Whether you need a one-time number or frequent verification, we have
            a plan for you. Pay only for what you need, with options for all
            budgets.
          </p>
          <button className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
            View Pricing
          </button>
        </div>
      </div>
    </>
  );
}
