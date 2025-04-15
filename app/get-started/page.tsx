import React from "react";
import Link from "next/link";
import Header from "../components/header";
import {
  CheckCircleIcon,
  BoltIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const GetStarted = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full bg-white rounded-xl border overflow-hidden">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-red-600 to-pink-600 p-12 text-white">
            <div className="absolute inset-0 bg-opacity-20 bg-white"></div>
            <div className="relative z-10 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Get Started with SMSGlobe
              </h1>
              <p className="mt-6 text-xl md:text-2xl leading-relaxed">
                The most reliable virtual phone number service for verification
                and privacy protection
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/services"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white hover:bg-opacity-20 transition"
                >
                  View Pricing Plans
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="p-12 bg-white">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose SMSGlobe?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <BoltIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Instant Activation
                </h3>
                <p className="text-gray-600">
                  Get your virtual numbers immediately after registration with
                  no delays.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <GlobeAltIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Global Coverage
                </h3>
                <p className="text-gray-600">
                  Numbers from 50+ countries including USA, UK, and many
                  European countries.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheckIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Secure & Private
                </h3>
                <p className="text-gray-600">
                  Your data is protected with bank-level encryption and strict
                  privacy policies.
                </p>
              </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="p-12 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-center text-gray-600 mb-12">
                Get started in just 3 simple steps
              </p>

              <div className="space-y-12">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0 w-24 h-24 bg-red-600 text-white flex items-center justify-center rounded-full text-4xl font-bold shadow-lg">
                    1
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Register Your Account
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">
                      Create your free account in under a minute. No credit card
                      required to start.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Email verification only</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Instant access after registration</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0 w-24 h-24 bg-red-600 text-white flex items-center justify-center rounded-full text-4xl font-bold shadow-lg">
                    2
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Choose Your Plan
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">
                      Select from our flexible pricing options based on your
                      needs.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Pay-as-you-go options available</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Volume discounts for businesses</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0 w-24 h-24 bg-red-600 text-white flex items-center justify-center rounded-full text-4xl font-bold shadow-lg">
                    3
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Start Receiving SMS
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">
                      Get your virtual number and start receiving verification
                      codes immediately.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Numbers work with all major platforms</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span>24/7 customer support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="p-12 bg-white">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Trusted by Thousands Worldwide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "SMSGlobe saved our business when we needed international verification numbers quickly.",
                  author: "Alex K., Startup Founder",
                },
                {
                  quote:
                    "The most reliable service I've used. Numbers always work when I need them.",
                  author: "Maria S., Freelancer",
                },
                {
                  quote:
                    "Excellent customer support and easy-to-use dashboard. Highly recommended!",
                  author: "James T., Developer",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-red-500 text-4xl mb-4">&quot;</div>
                  <p className="text-gray-700 text-lg mb-4">
                    {testimonial.quote}
                  </p>
                  <p className="text-gray-500 font-medium">
                    {testimonial.author}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users who trust SMSGlobe for their
              virtual number needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="bg-white text-red-600 px-10 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition shadow-lg hover:border"
              >
                Sign Up Free
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-white hover:bg-opacity-20 transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GetStarted;
