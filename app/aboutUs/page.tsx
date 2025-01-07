"use client";

import React from "react";
import Footer from "../components/footer";
import Image from "next/image";

const About = () => {
  return (
    <div className="w-[80%] m-auto  text-gray-800 py-12 px-4 mb-5">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            About Us
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Secure, Private, and Reliable. Simplifying Your Online Interactions.
          </p>
        </div>

        {/* Our Mission Section */}
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At <strong>SmsGlobe</strong>, our goal is to provide secure and
              temporary phone numbers for SMS verification, ensuring your
              personal data remains protected. Whether signing up for platforms
              or verifying accounts, we’ve got you covered. Our platform is
              built to offer privacy, convenience, and ease of use for
              individuals and businesses worldwide.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <Image
              src={"/image3.png"}
              alt="mission"
              width={400}
              height={300}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Why Choose Us?
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 bg-white rounded-lg border">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <i className="fas fa-lock text-green-600 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Privacy</h3>
              <p className="text-gray-600 mt-2">
                Your personal number stays private, protecting your identity and
                reducing spam.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <i className="fas fa-phone-alt text-blue-600 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Global Reach</h3>
              <p className="text-gray-600 mt-2">
                Access numbers from multiple countries, catering to your global
                needs.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <i className="fas fa-wallet text-yellow-600 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Affordability</h3>
              <p className="text-gray-600 mt-2">
                Enjoy competitive pricing that fits your budget.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <i className="fas fa-globe text-purple-600 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Accessibility</h3>
              <p className="text-gray-600 mt-2">
                Simple and intuitive design that makes our service easy to use
                for everyone.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <i className="fas fa-cogs text-red-600 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reliability</h3>
              <p className="text-gray-600 mt-2">
                Fast and dependable service to meet your verification needs.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed">
            Founded with the belief that privacy is a fundamental right,
            <strong>SmsGlobe</strong> emerged as a solution to protect online
            identities without compromising convenience. Our dedicated team is
            passionate about creating tools that enhance digital safety and
            empower individuals to navigate the online world securely.
          </p>
        </div>
      </div>
      <div className="mb-10"></div>
    </div>
  );
};

export default About;
