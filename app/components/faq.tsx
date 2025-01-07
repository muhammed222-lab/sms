"use client";

import { useState } from "react";
import Head from "next/head";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How long can I keep my temporary number?",
      answer:
        "You can set the desired duration when you purchase a number, ensuring it’s available as long as you need.",
    },
    {
      question: "Can I use the same number for multiple services?",
      answer:
        "Yes, each number can be used for multiple verifications across different platforms.",
    },
    {
      question: "How does the deposit system work?",
      answer:
        "Simply top up your account balance. The funds stay in your account and can be used whenever you purchase a number or receive SMS messages.",
    },
    {
      question: "Is my information secure?",
      answer:
        "Absolutely. We prioritize data privacy and ensure all information is securely stored and accessible only to you.",
    },
  ];

  return (
    <>
      <Head>
        <title>FAQ</title>
      </Head>
      <div className="py-12 px-4 ">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">
            FAQ
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Frequently Asked Questions
          </p>
          <div className="mt-8 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`border rounded-lg ${
                  activeIndex === index
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left flex items-center justify-between p-4 text-gray-800"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <span
                    className={`transform ${
                      activeIndex === index ? "rotate-180 text-blue-500" : ""
                    } transition-transform`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>
                {activeIndex === index && (
                  <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
