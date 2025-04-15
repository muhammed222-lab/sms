import React from "react";
import Link from "next/link";
import Header from "../components/header";
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const ServicesPricing = () => {
  const pricingPlans = [
    {
      title: "Pay-As-You-Go",
      price: "$1 - $3 per number",
      description:
        "Ideal for individuals who need temporary numbers occasionally.",
      features: [
        "Purchase numbers individually",
        "Basic email support",
        "Access to 10+ countries",
        "Numbers start at just $0.03",
      ],
      buttonText: "Fund Your Account",
    },
    {
      title: "Bulk Purchases",
      price: "$3 - $10 per batch",
      description: "Perfect for frequent users needing multiple verifications.",
      features: [
        "5-20 numbers per purchase",
        "Priority support",
        "Access to 30+ countries",
        "Better rates for bulk purchases",
      ],
      buttonText: "Fund Your Account",
      isPopular: true,
    },
    {
      title: "Number Rental",
      price: "$20 - $30 per month",
      description:
        "Best for businesses requiring dedicated numbers for longer periods.",
      features: [
        "Dedicated numbers for your use",
        "24/7 dedicated support",
        "Access to all countries",
        "Custom rental periods available",
      ],
      buttonText: "Fund Your Account",
    },
  ];

  return (
    <>
      <Header />
      <div className="relative w-full max-w-7xl mx-auto min-h-screen px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Flexible Pricing Based on Your Needs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No monthly subscriptions - simply deposit funds and use what you
            need. Your balance never expires.
          </p>
        </div>

        {/* How It Works Section */}
        <div className=" rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            How Our Deposit System Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Deposit Funds</h3>
              <p className="text-gray-600">
                Add any amount to your account balance (minimum $1)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Purchase Numbers</h3>
              <p className="text-gray-600">
                Use your balance to buy numbers as you need them
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Use & Repeat</h3>
              <p className="text-gray-600">
                Your balance stays until you use it - no expiration
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Choose Your Usage Style
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-xl border-2 ${
                  plan.isPopular
                    ? "border-red-500 shadow-xl bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 text-sm font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {plan.title}
                </h2>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  {plan.price}
                </p>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/deposit"
                  className={`w-full flex items-center justify-center ${
                    plan.isPopular
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-800 hover:bg-gray-900"
                  } text-white py-3 px-6 rounded-lg font-medium transition-colors`}
                >
                  {plan.buttonText}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold mb-2">
                Is this a subscription service?
              </h3>
              <p className="text-gray-600">
                No! We operate on a deposit-based system. You add funds to your
                account balance, and then use those funds to purchase numbers as
                you need them. Your balance never expires.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold mb-2">
                How much should I deposit?
              </h3>
              <p className="text-gray-600">
                You can deposit any amount (minimum $1). Numbers start at just
                $0.03, so even a small deposit can get you started. Frequent
                users typically deposit $10-20 at a time.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold mb-2">
                Can I get a refund on unused balance?
              </h3>
              <p className="text-gray-600">
                Yes! Unused funds can be refunded to your original payment
                method at any time, minus any transaction fees.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Deposit funds today and gain access to virtual numbers from around
            the world.
          </p>
          <Link
            href="/deposit"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition-colors shadow-lg"
          >
            Deposit Funds Now
          </Link>
        </div>
      </div>
    </>
  );
};

export default ServicesPricing;
