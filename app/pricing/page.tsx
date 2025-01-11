import React from "react";
import Link from "next/link";
import Header from "../components/header";
const ServicesPricing = () => {
  const pricingPlans = [
    {
      title: "Basic",
      price: "$3",
      description:
        "Ideal for individuals who need temporary numbers occasionally.",
      features: [
        "1 Temporary Number",
        "Basic Support",
        "Access to 10+ Countries",
      ],
      buttonText: "Choose Basic",
    },
    {
      title: "Pro",
      price: "$9",
      description: "Perfect for frequent users needing multiple verifications.",
      features: [
        "5 Temporary Numbers",
        "Priority Support",
        "Access to 30+ Countries",
      ],
      buttonText: "Choose Pro",
      isPopular: true,
    },
    {
      title: "Enterprise",
      price: "$29",
      description: "Best for businesses requiring high-volume verifications.",
      features: [
        "Unlimited Numbers",
        "Dedicated Account Manager",
        "Access to All Countries",
      ],
      buttonText: "Choose Enterprise",
    },
  ];

  return (
    <>
      <Header />
      <div className="relative w-[80%] m-auto min-h-[500px]">
        {/* Content Container */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                Our Services
                <br />& Pricing
              </h1>
              <p className="text-gray-700 text-lg max-w-md">
                Sign up now and get a free number to experience the convenience
                and security of our temporary phone number service.
              </p>
              <Link
                href="/get-started"
                className="inline-block bg-red-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-red-600 transition-colors"
              >
                Get Started Now
              </Link>
            </div>

            {/* Right Content - Pricing Circle */}
            <div className="relative">
              {/* Decorative Blobs */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-blue-400 rounded-full opacity-50 blur-lg absolute -left-4"></div>
                <div className="w-32 h-32 bg-purple-400 rounded-full opacity-50 blur-lg absolute -top-4"></div>
                <div className="w-32 h-32 bg-green-400 rounded-full opacity-50 blur-lg absolute -right-4"></div>
                <div className="w-32 h-32 bg-indigo-400 rounded-full opacity-50 blur-lg absolute -bottom-4"></div>
              </div>

              {/* Price Circle */}
              <div className="relative w-48 h-48 bg-white rounded-full mx-auto flex flex-col items-center justify-center shadow-lg">
                <p className="text-sm font-medium">Start from</p>
                <p className="text-4xl font-bold">$3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`p-6 border rounded-lg shadow-lg ${
                  plan.isPopular ? "border-red-500" : ""
                }`}
              >
                {plan.isPopular && (
                  <div className="bg-red-500 text-white px-4 py-1 text-sm rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-800">
                  {plan.title}
                </h2>
                <p className="text-4xl font-bold text-gray-800 my-4">
                  {plan.price}
                </p>
                <p className="text-gray-600">{plan.description}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <i className="fas fa-check text-green-600 mr-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full w-full hover:bg-red-600 transition-colors">
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Dots Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="grid grid-cols-5 gap-2">
            {[...Array(25)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPricing;
