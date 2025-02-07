"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import emailjs from "@emailjs/browser";
// import { FaSun, FaMoon } from "react-icons/fa"; // Icons for Light and Dark Mode
// import Mode from "./Mode";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Success message state

  // Validate email format
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // Handle the form submission
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error on new submission
    setSuccess(""); // Reset success message on new submission

    // Validate email
    if (!validateEmail(email)) {
      setLoading(false);
      setError("Please enter a valid email address.");
      return;
    }

    const date = new Date().toLocaleDateString(); // Get the current date

    // Template parameters for admin email (notification)
    const adminTemplateParams = {
      email: email, // User's email
      date: date, // Subscription date
    };

    // Send email to admin (Deemax Team)
    emailjs
      .send(
        "service_fcfp3h6",
        "template_riibwa6",
        adminTemplateParams,
        "rHzdi_ODUDr3TnYNl"
      )
      .then((response) => {
        console.log("Admin notification sent successfully:", response);

        // Template parameters for user confirmation email
        const userTemplateParams = {
          from_name: email, // User's email as the name
          from_email: email, // User's email
          date: date, // Subscription date
        };

        // Send confirmation email to the user
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
            setSuccess("Thank you for subscribing!"); // Show success message
            setEmail(""); // Clear the email input field
          })
          .catch((err) => {
            console.error("User email send failed:", err);
            setError("Failed to send email to user.");
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("Admin email send failed:", err);
        setError("Failed to send email to admin.");
        setLoading(false);
      });
  };

  // Check the saved theme in localStorage or use device preference

  // Toggle theme between light, dark, and save in localStorage

  return (
    <footer className="px-4 py-8 md:px-8 w-[80%] m-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Description */}
        <div className="col-span-1">
          <Image
            src="/deemax.png"
            alt="Deemax Logo"
            width={150}
            height={50}
            className="mb-4 rounded-3xl"
          />
          <p className="text-gray-700 mb-4">
            Providing reliable, secure, and private verification solutions
            worldwide.
          </p>
        </div>

        {/* Newsletter */}
        <div className="col-span-1 md:col-span-3">
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Subscribe to our newsletter
            </h3>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you-mail@gmail.com"
                className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? "bg-gray-400" : "bg-red-500"
                } text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors`}
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">{success}</p>}{" "}
            {/* Success message */}
          </div>

          {/* Theme toggle button for light, dark, and device modes */}
          {/* Links Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Our Links */}
            <div>
              <h4 className="text-red-500 font-semibold mb-4">Our Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Our Services */}
            <div>
              <h4 className="text-red-500 font-semibold mb-4">Our Services</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/strategy"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Strategy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/research"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Research
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Other Links */}
            <div>
              <h4 className="text-red-500 font-semibold mb-4">Other Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Contact Us | support@smsglobe.net
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <Link href="/terms" className="text-gray-600 hover:text-gray-900">
          Terms and Conditions
        </Link>
      </div>

      {/* <Mode /> */}
    </footer>
  );
};

export default Footer;
