"use client";

import React from "react";

const Services = () => {
  const services = [
    {
      title: "Temporary Phone Numbers",
      description:
        "Get instant, secure temporary phone numbers for SMS verification on various platforms like Facebook, WhatsApp, and more.",
      icon: "fas fa-mobile-alt",
    },
    {
      title: "Global Coverage",
      description:
        "Access phone numbers from multiple countries, ensuring seamless verification for international services.",
      icon: "fas fa-globe",
    },
    {
      title: "Affordable Pricing",
      description:
        "Enjoy cost-effective solutions tailored to meet your verification needs without breaking the bank.",
      icon: "fas fa-wallet",
    },
    {
      title: "Privacy Protection",
      description:
        "Keep your personal number safe with our virtual alternatives, protecting you from spam and fraud.",
      icon: "fas fa-shield-alt",
    },
    {
      title: "Instant Activation",
      description:
        "Activate and use virtual numbers instantly, ensuring quick and hassle-free verifications.",
      icon: "fas fa-bolt",
    },
    {
      title: "Flexible Usage",
      description:
        "Use our temporary numbers across various platforms and services without limitations.",
      icon: "fas fa-sync",
    },
  ];

  return (
    <section className="b py-12 px-4 w-[80%] m-auto">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Our Services</h1>
        <p className="text-lg text-gray-600 mb-12">
          SmsGlobe provides virtual verification solutions designed to ensure
          privacy, security, and convenience. Explore our core services below:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border p-6 transition-transform transform hover:scale-105"
            >
              <div className="flex items-center justify-center h-16 w-16 bg-green-100 text-green-600 rounded-full mb-4 mx-auto">
                <i className={service.icon + " text-3xl"}></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {service.title}
              </h2>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
