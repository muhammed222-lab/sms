"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import {
  FaInstagram,
  FaTwitter,
  FaFacebookF,
  FaTelegramPlane,
} from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const socialLinks = [
    {
      name: "Instagram",
      url: "https://instagram.com/smsglobe",
      icon: <FaInstagram className="text-xl" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      name: "Twitter",
      url: "https://x.com/smsglobe84278",
      icon: <FaTwitter className="text-xl" />,
      color: "bg-blue-400",
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1HZvHH4Hnn/?mibextid=wwXIfr",
      icon: <FaFacebookF className="text-xl" />,
      color: "bg-blue-600",
    },
    {
      name: "Telegram",
      url: "https://www.t.me/smsglobe",
      icon: <FaTelegramPlane className="text-xl" />,
      color: "bg-blue-500",
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setLoading(false);
      setError("Please enter a valid email address.");
      return;
    }

    const date = new Date().toLocaleDateString();

    const adminTemplateParams = {
      email: email,
      date: date,
    };

    emailjs
      .send(
        "service_fcfp3h6",
        "template_riibwa6",
        adminTemplateParams,
        "rHzdi_ODUDr3TnYNl"
      )
      .then((response) => {
        console.log("Admin notification sent successfully:", response);

        const userTemplateParams = {
          from_name: email,
          from_email: email,
          date: date,
        };

        emailjs
          .send(
            "service_fcfp3h6",
            "template_ov63lab",
            userTemplateParams,
            "rHzdi_ODUDr3TnYNl"
          )
          .then((userResponse) => {
            console.log("User confirmation sent successfully:", userResponse);
            setLoading(false);
            setSuccess("Thank you for subscribing!");
            setEmail("");
          })
          .catch((err) => {
            console.error("User email send failed:", err);
            setError("Failed to send confirmation email.");
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("Admin email send failed:", err);
        setError("Failed to process your subscription.");
        setLoading(false);
      });
  };

  return (
    <footer className="px-4 py-8 w-full max-w-7xl mx-auto ">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Logo and Description */}
        <div className="col-span-1 flex flex-col items-center lg:items-start">
          <Image
            src="/deemax.png"
            alt="Deemax Logo"
            width={150}
            height={50}
            className="mb-4 rounded-3xl"
            priority
          />
          <p className="text-gray-700 mb-4 text-center lg:text-left">
            Providing reliable, secure, and private verification solutions
            worldwide.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${social.color} text-white p-2 rounded-full hover:opacity-90 transition-all`}
                aria-label={social.name}
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter and Links */}
        <div className="col-span-1 lg:col-span-3">
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center lg:text-left">
              Subscribe to our newsletter
            </h3>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto lg:mx-0"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@gmail.com"
                className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                } text-white px-6 py-2 rounded-md transition-colors whitespace-nowrap`}
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {error && (
              <p className="text-red-500 mt-2 text-sm text-center lg:text-left">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-500 mt-2 text-sm text-center lg:text-left">
                {success}
              </p>
            )}
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center sm:text-left">
              <h4 className="text-red-500 font-semibold mb-4">Our Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h4 className="text-red-500 font-semibold mb-4">Our Services</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/strategy"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Strategy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/research"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Research
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h4 className="text-red-500 font-semibold mb-4">Other Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Contact Us | support@smsglobe.net
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 text-center lg:text-left">
        <Link
          href="/terms"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Terms and Conditions
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
