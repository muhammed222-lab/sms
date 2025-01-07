"use client";

import React from "react";

const FAQPage = () => {
  return (
    <div className="w-[80%] m-auto py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions? We have answers! Here are the most common questions
          about our services. If you need further assistance, feel free to
          contact us.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 space-y-8">
        {/* Question 1 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800">
            How do I get started with SmsGlobe?
          </h3>
          <p className="mt-2 text-gray-600">
            Getting started with SmsGlobe is easy! Simply sign up on our
            platform, and you will instantly get access to virtual verification
            services.
          </p>
        </div>

        {/* Question 2 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800">
            What is virtual verification?
          </h3>
          <p className="mt-2 text-gray-600">
            Virtual verification allows you to verify your identity online using
            secure and temporary methods without revealing your personal
            information.
          </p>
        </div>

        {/* Question 3 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Is my data safe with SmsGlobe?
          </h3>
          <p className="mt-2 text-gray-600">
            Yes, we prioritize your privacy and security. Our platform uses the
            latest encryption technologies to ensure your data is always
            protected.
          </p>
        </div>

        {/* Question 4 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Can I use SmsGlobe on mobile devices?
          </h3>
          <p className="mt-2 text-gray-600">
            Absolutely! SmsGlobe is fully optimized for mobile devices, so you
            can access our services anytime, anywhere.
          </p>
        </div>

        {/* Additional Questions */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600">
            Don't see your question? Contact our support team for further
            assistance.
          </p>
          <button className="mt-4 bg-red-500 text-white py-3 px-6 rounded-full text-lg hover:bg-red-600 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
