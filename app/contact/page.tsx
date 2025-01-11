"use client";

import React from "react";

import Header from "../components/header";
const Contact = () => {
  return (
    <>
      <Header />
      <section className=" py-12 px-4 w-[80%] m-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800">Contact Us</h1>
            <p className="text-gray-600 mt-4 text-lg">
              We would love to hear from you! Whether you have a question,
              feedback, or need support, our team at SmsGlobe is here to help.
            </p>
          </div>

          <div className="flex flex-wrap -mx-4">
            {/* Contact Form */}
            <div className="w-full md:w-2/3 px-4">
              <form className="bg-white rounded-lg border p-6">
                <div className="mb-6">
                  <label
                    className="block text-sm font-bold text-gray-600"
                    htmlFor="name"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full mt-2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-sm font-bold text-gray-600"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full mt-2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-sm font-bold text-gray-600"
                    htmlFor="message"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full mt-2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Type your message here..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="w-full md:w-1/3 px-4 mt-12 md:mt-0">
              <div className="bg-green-100 rounded-lg p-6 border">
                <h2 className="text-2xl font-bold text-gray-800">
                  Contact Details
                </h2>
                <p className="text-gray-600 mt-4">
                  Feel free to reach out to us using the following details:
                </p>
                <div className="mt-6">
                  <p className="flex items-center text-gray-700">
                    <i className="fas fa-phone-alt mr-3"></i> +1 (123) 456-7890
                  </p>
                  <p className="flex items-center text-gray-700 mt-4">
                    <i className="fas fa-envelope mr-3"></i>{" "}
                    service@smsglobe.net
                  </p>
                  <p className="flex items-center text-gray-700 mt-4">
                    <i className="fas fa-map-marker-alt mr-3"></i> 123
                    Innovation Street, Tech City, USA
                  </p>
                </div>
                <div className="mt-6">
                  <h3 className="font-bold text-gray-800">Follow Us</h3>
                  <div className="flex space-x-4 mt-4">
                    <a href="#" className="text-gray-500 hover:text-green-600">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-green-600">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-green-600">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-green-600">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
