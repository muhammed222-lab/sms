"use client";

import React from "react";
import Header from "../components/header";

const AboutPage: React.FC = () => {
  return (
    <>
      <Header />

      <div className="min-h-screen  flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-lg border max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6 text-center">
            About SMS Globe
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6 text-lg text-justify">
            Welcome to{" "}
            <span className="font-bold text-blue-600">SMS Globe</span>, your
            ultimate solution for seamless and reliable SMS services. At SMS
            Globe, we are driven by a singular mission: to empower individuals
            and businesses with fast, secure, and affordable communication tools
            that connect them to the world.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6 text-lg text-justify">
            Whether you&apos;re a startup looking to engage customers, a
            business needing transactional SMS, or an individual seeking
            reliable SMS solutions, SMS Globe is here to deliver with
            excellence. Our platform is equipped with cutting-edge technology
            that ensures timely and efficient message delivery, while our
            user-friendly interface makes managing your communication needs a
            breeze.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6 text-lg text-justify">
            We also take pride in our strong focus on customer satisfaction,
            providing top-notch support and competitive pricing to meet the
            diverse needs of our clients. With SMS Globe, you are assured of
            uncompromising quality and unparalleled service every step of the
            way.
          </p>
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed mb-6 text-lg text-justify">
            To become the global leader in SMS solutions, enabling businesses
            and individuals to communicate seamlessly, effectively, and
            affordably.
          </p>
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-lg text-justify">
            At SMS Globe, our mission is to provide innovative, reliable, and
            cost-effective SMS services that empower our users to stay connected
            and achieve their communication goals.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/contact"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
