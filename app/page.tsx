/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
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
import dynamic from "next/dynamic";

// Dynamically import the globe component with no SSR to prevent hydration issues
const Globe = dynamic(() => import("./components/Globe"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 rounded-xl"></div>,
});

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<null | { email: string }>(null);
  const [currentActivity, setCurrentActivity] = useState<string>("");
  const [currentBonus, setCurrentBonus] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ? { email: currentUser.email || "" } : null);
    });
    return () => unsubscribe();
  }, []);

  // Simulate real-time SMS verification activity with more fun messages
  useEffect(() => {
    const platforms = [
      { name: "Facebook", icon: "📘" },
      { name: "WhatsApp", icon: "💚" },
      { name: "Instagram", icon: "📷" },
      { name: "Telegram", icon: "📨" },
      { name: "Twitter", icon: "🐦" },
      { name: "Google", icon: "🔍" },
      { name: "Microsoft", icon: "🪟" },
      { name: "Snapchat", icon: "👻" },
      { name: "LinkedIn", icon: "💼" },
      { name: "TikTok", icon: "🎵" },
      { name: "Pinterest", icon: "📌" },
      { name: "Reddit", icon: "🤖" },
      { name: "Amazon", icon: "📦" },
      { name: "eBay", icon: "💰" },
      { name: "PayPal", icon: "💸" },
      { name: "Spotify", icon: "🎧" },
      { name: "Netflix", icon: "🍿" },
      { name: "Zoom", icon: "📹" },
      { name: "Slack", icon: "💬" },
      { name: "Discord", icon: "🎮" },
    ];

    const countries = [
      { name: "US", flag: "🇺🇸" },
      { name: "UK", flag: "🇬🇧" },
      { name: "Canada", flag: "🇨🇦" },
      { name: "Germany", flag: "🇩🇪" },
      { name: "France", flag: "🇫🇷" },
      { name: "Nigeria", flag: "🇳🇬" },
      { name: "India", flag: "🇮🇳" },
      { name: "Australia", flag: "🇦🇺" },
      { name: "Brazil", flag: "🇧🇷" },
      { name: "Japan", flag: "🇯🇵" },
      { name: "China", flag: "🇨🇳" },
      { name: "South Korea", flag: "🇰🇷" },
      { name: "Italy", flag: "🇮🇹" },
      { name: "Spain", flag: "🇪🇸" },
      { name: "Mexico", flag: "🇲🇽" },
      { name: "Russia", flag: "🇷🇺" },
      { name: "South Africa", flag: "🇿🇦" },
      { name: "Netherlands", flag: "🇳🇱" },
      { name: "Sweden", flag: "🇸🇪" },
      { name: "Argentina", flag: "🇦🇷" },
    ];

    const activities = [
      "just smashed verification!",
      "bypassed SMS restrictions!",
      "got instant access!",
      "verified in seconds!",
      "secured their account!",
      "protected their privacy!",
      "skipped phone linking!",
      "created a burner account!",
      "got past security checks!",
      "joined anonymously!",
    ];

    const activityInterval = setInterval(() => {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const activity =
        activities[Math.floor(Math.random() * activities.length)];

      setCurrentActivity(
        `${platform.icon} ${platform.name} ${activity} ${country.flag} ${country.name}`
      );

      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 2500);

    return () => clearInterval(activityInterval);
  }, []);

  // Simulate referral bonuses with more fun
  useEffect(() => {
    const generateRandomUsername = () => {
      const adjectives = [
        "Epic",
        "Mega",
        "Super",
        "Ultra",
        "Hyper",
        "Turbo",
        "Ninja",
        "Stealth",
        "Ghost",
        "Cyber",
      ];
      const nouns = [
        "Hacker",
        "Verifier",
        "Smasher",
        "Pro",
        "Master",
        "Wizard",
        "Agent",
        "Champ",
        "Legend",
        "Guru",
      ];
      return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
        nouns[Math.floor(Math.random() * nouns.length)]
      }`;
    };

    const bonusMessages = [
      "just scored",
      "banked",
      "pocketed",
      "racked up",
      "collected",
      "earned",
      "secured",
      "got paid",
      "is celebrating",
      "is flexing with",
    ];

    const bonusInterval = setInterval(() => {
      const amount = (Math.random() * 50 + 10).toFixed(2);
      const username = generateRandomUsername();
      const bonusMessage =
        bonusMessages[Math.floor(Math.random() * bonusMessages.length)];

      setCurrentBonus(`🎉 ${username} ${bonusMessage} $${amount} 🎉`);

      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 4000);

    return () => clearInterval(bonusInterval);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/signin");
    }
  };

  return (
    <>
      <Header />
      <div className="w-full max-w-7xl m-auto px-4">
        <main>
          <section className="hero py-10 lg:py-16">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Text Section */}
              <div className="w-full lg:w-1/2 space-y-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                    Burner Numbers
                  </span>{" "}
                  <br />
                  That Actually Work
                </h1>

                <p className="text-xl sm:text-2xl text-gray-600">
                  Get{" "}
                  <span className="font-bold text-blue-600">
                    instant access
                  </span>{" "}
                  to any platform without exposing your real number.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600">50K+</div>
                    <div className="text-gray-600">Verifications Today</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-3xl font-bold text-purple-600">
                      190+
                    </div>
                    <div className="text-gray-600">Countries Supported</div>
                  </div>
                </div>

                {/* Real-time activity ticker */}
                <div className="bg-gray-900 text-white p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <h3 className="font-semibold">Live Verification</h3>
                    </div>
                    <div
                      className={`transition-all duration-300 ${
                        isAnimating
                          ? "translate-y-2 opacity-0"
                          : "translate-y-0 opacity-100"
                      }`}
                    >
                      {currentActivity || "Loading live activity..."}
                    </div>
                  </div>
                </div>

                {/* Referral bonus ticker */}
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-4 rounded-xl border border-amber-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/10 rounded-full -mr-4 -mt-4"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-400/10 rounded-full -ml-4 -mb-4"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-800">
                        Latest Bonus
                      </h3>
                    </div>
                    <div
                      className={`transition-all duration-300 ${
                        isAnimating
                          ? "translate-y-2 opacity-0"
                          : "translate-y-0 opacity-100"
                      }`}
                    >
                      {currentBonus || "Loading recent bonuses..."}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    className="cta-btn bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:opacity-90 transition duration-300 border hover:shadow-xl transform hover:-translate-y-1"
                    onClick={handleGetStarted}
                  >
                    Get Your Number Now
                  </button>
                  <button
                    className="cta-btn py-4 px-8 rounded-xl border border-gray-300 hover:bg-gray-100 transition duration-30"
                    onClick={() => router.push("/about")}
                  >
                    See How It Works →
                  </button>
                </div>
              </div>

              {/* Globe Animation Section */}
              <div className="w-full lg:w-1/2 mt-10 lg:mt-0">
                <div className="relative h-[400px] lg:h-[500px] w-full">
                  <Globe />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center p-6 bg-black/70 backdrop-blur-sm rounded-full">
                      <div className="text-4xl font-bold text-white">100%</div>
                      <div className="text-white/80">Anonymous</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-20 text-center bg-white p-8 rounded-2xl border border-gray-100">
            <p className="text-2xl sm:text-3xl font-medium">
              "This service saved me when I needed to verify multiple accounts
              for my business.{" "}
              <span className="text-blue-600">
                No more buying expensive SIM cards!
              </span>
              "
            </p>
            <div className="mt-4 text-gray-500">- Verified User</div>
          </div>
        </main>

        <HowItWorks />
        <Cooperation />
        <WhyChooseUs />
        <PricingSection />
        <FAQ />
      </div>
    </>
  );
}
