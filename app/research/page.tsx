"use client";

import React from "react";

const ResearchPage = () => {
  return (
    <div className="w-[80%] m-auto py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Our Research & Insights
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          SmsGlobe is dedicated to advancing the field of virtual verification.
          Our research focuses on improving security, privacy, and user
          experience. Here are some of our key findings and studies.
        </p>
      </div>

      {/* Research Section */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Research Article 1 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Study on the Future of Digital Identity Verification
          </h3>
          <p className="mt-2 text-gray-600">
            This study explores the future trends in digital identity
            verification and how virtual methods are becoming essential for
            secure online interactions.
          </p>
          <a
            href="/research-article-1"
            className="text-blue-500 hover:text-blue-600 mt-4 inline-block"
          >
            Read Full Study
          </a>
        </div>

        {/* Research Article 2 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Improving Privacy in Virtual Verification Systems
          </h3>
          <p className="mt-2 text-gray-600">
            In this paper, we examine the methods for improving privacy while
            using virtual verification services, ensuring personal data remains
            protected.
          </p>
          <a
            href="/research-article-2"
            className="text-blue-500 hover:text-blue-600 mt-4 inline-block"
          >
            Read Full Study
          </a>
        </div>

        {/* Research Article 3 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Secure Methods for Temporary Identity Verification
          </h3>
          <p className="mt-2 text-gray-600">
            This research paper outlines the various techniques for providing
            secure and temporary identity verification that users can trust.
          </p>
          <a
            href="/research-article-3"
            className="text-blue-500 hover:text-blue-600 mt-4 inline-block"
          >
            Read Full Study
          </a>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-24">
        <h3 className="text-3xl font-semibold text-gray-800">
          Explore More Research
        </h3>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          We are committed to improving virtual verification technologies and
          their application in security. Check out more of our research
          publications.
        </p>
        <button className="mt-6 bg-red-500 text-white py-3 px-6 rounded-full text-lg hover:bg-red-600 transition-colors">
          See All Research
        </button>
      </div>
    </div>
  );
};

export default ResearchPage;
