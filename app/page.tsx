"use client";

import ImageSlider from "./components/ImageSlider";
import HowItWorks from "./components/HowItWorks";
import "./globals.css";
import React, { useEffect, useState } from "react";
import WhyChooseUs from "./components/whyUs";
import PricingSection from "./components/price";
import FAQ from "./components/faq";
import Cooperation from "./components/cooperation";
import { useRouter } from "next/navigation";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./components/header";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<null | { email: string }>(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ? { email: currentUser.email || "" } : null);
    });
    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="w-[80%] m-auto">
      <Header />
      <main>
        <div className="mx-auto px-4">
          <section className="hero py-10 lg:py-20">
            <div className="hero-content flex flex-col-reverse lg:flex-row items-center">
              {/* Text Section */}
              <div className="text-section text-center lg:text-left lg:w-1/2 space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  Secure & Instant Temporary Phone Numbers for Verification
                </h1>
                <p className="text-lg sm:text-xl text-gray-600">
                  Generate temporary phone numbers for SMS verification on any
                  platform—Facebook, WhatsApp, Instagram, and more. Safe,
                  affordable, and accessible worldwide.
                </p>
                <div className="flex justify-center lg:justify-start space-x-4">
                  <button
                    className="cta-btn bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition duration-300"
                    onClick={handleGetStarted}
                  >
                    Get Started Now
                  </button>
                  <button className="cta-btn py-2 px-6 rounded-md border border-gray-800 hover:bg-gray-100 transition duration-300">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Image Slider Section */}
              <div className="slider-section lg:w-1/2 mt-10 lg:mt-0">
                <ImageSlider />
              </div>
            </div>

            <div className="description mt-10 text-center lg:text-left text-gray-700">
              <p className="text-lg sm:text-xl">
                In today&apos;s digital world, privacy is essential. Our service
                provides temporary phone numbers for SMS verification, keeping
                your personal number secure and protecting your online identity.
                No more spam calls, no more unwanted messages—just a simple,
                seamless solution.
              </p>
            </div>
          </section>
        </div>
      </main>

      <HowItWorks />
      <Cooperation />
      <WhyChooseUs />
      <PricingSection />
      <FAQ />
    </div>
  );
}
