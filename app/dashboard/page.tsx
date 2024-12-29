/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  FaSms,
  FaMobileAlt,
  FaUser,
  FaWallet,
  FaInfoCircle,
  FaCommentDots,
  FaBars,
  FaBell,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
// import Select from "react-select";
import DashboardBalance from "../components/DashboardBalance";
import RentNumbers from "../components/RentNumbers";
import Feedback from "../components/Feedback";
import Profile from "../components/profile";
// import RecentSmsOrders from "../components/RecentSmsOrders";
import Tutor from "../components/Tutor";
import Notifications from "../components/Notifications"; // New Notifications Component
// import PricesTable from "../test/page";
import Sms from "../components/Sms";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("Receive SMS");

  interface RequestedNumber {
    request_id: string;
    number: string;
  }

  const [requestedNumber, setRequestedNumber] =
    useState<RequestedNumber | null>(null);
  const [notifications, setNotifications] = useState([]); // Notifications state
  const [selectedCountry, setSelectedCountry] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedService, setSelectedService] = useState<
    { label: string; value: string }[]
  >([]);

  const sidebarLinks = [
    { label: "Receive SMS", id: "sms", icon: <FaSms /> },
    { label: "Rent Numbers", id: "rent", icon: <FaMobileAlt /> },
    { label: "Profile", id: "profile", icon: <FaUser /> },
    { label: "Top Up Balance", id: "balance", icon: <FaWallet /> },
    { label: "Instructions", id: "instructions", icon: <FaInfoCircle /> },
    { label: "Feedback", id: "feedback", icon: <FaCommentDots /> },
  ];

  useEffect(() => {
    const fetchBalance = async (balance: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/balance`);
        const data = await response.json();
        fetchBalance(data.balance || 0);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    const fetchCountries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/countries`);
        const data = (await response.json()) as { title: string; id: string }[];
        setSelectedCountry(
          data.map((c) => ({
            label: c.title,
            value: c.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/services`);
        const data = (await response.json()) as { title: string; id: string }[];
        setSelectedService(
          data.map((s) => ({
            label: s.title,
            value: s.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications`);
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchBalance(0);
    fetchCountries();
    fetchServices();
    fetchNotifications();
  }, []);

  interface Message {
    type: "success" | "error";
    content: string;
  }

  const [, setMessage] = useState<Message | null>(null); // State for messages or errors

  const requestPhoneNumber = async () => {
    if (!selectedService || !selectedCountry) {
      setMessage({
        type: "error",
        content: "Please select a country and a service.",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/get-number?country_id=${selectedCountry.values}&application_id=${selectedService.values}`
      );
      const data = await response.json();
      if (data.number) {
        setRequestedNumber(data);
        fetchSmsCode("");
        setMessage({
          type: "success",
          content: `Phone number requested successfully: ${data.number}`,
        });
      } else {
        setMessage({
          type: "error",
          content: `Failed to request a number. Reason: ${
            data.error_msg || "Unknown error."
          }`,
        });
      }
    } catch (error) {
      console.error("Error requesting number:", error);
      setMessage({
        type: "error",
        content: `Error requesting number: ${(error as Error).message}`,
      });
    }
  };

  const fetchSmsCode = async (sms_code: string) => {
    if (!requestedNumber) {
      setMessage({
        type: "error",
        content:
          "No phone number requested. Please request a phone number first.",
      });
      return;
    }

    try {
      const response = await fetch(
        `https://api.sms-man.com/control/get-sms?token=${API_TOKEN}&request_id=${requestedNumber.request_id}`
      );
      const data = await response.json();
      if (data.sms_code) {
        fetchSmsCode(data.sms_code);
        setMessage({
          type: "success",
          content: `SMS Code received: ${data.sms_code}`,
        });
      } else {
        setMessage({
          type: "error",
          content: `Failed to fetch SMS code. Reason: ${
            data.error_msg || "Still waiting for SMS..."
          }`,
        });
      }
    } catch (error) {
      console.error("Error fetching SMS code:", error);
      setMessage({
        type: "error",
        content: `Error fetching SMS code: ${(error as Error).message}`,
      });
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case "Receive SMS":
        return <Sms />;
      case "Top Up Balance":
        return <DashboardBalance />;
      case "Rent Numbers":
        return <RentNumbers />;
      case "Profile":
        return <Profile />;
      case "Instructions":
        return <Tutor />;
      case "Feedback":
        return <Feedback />;
      case "Notifications":
        return <Notifications notifications={notifications} />; // Render Notifications
      default:
        return (
          <div className="bg-white border p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Dashboard</h2>
            <p>Select a page from the navigation bar.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar (Responsive as Tabs on Mobile) */}
      <nav
        className={`bg-gray-800 text-white transition-all duration-300 ${
          isSidebarOpen ? "block" : "hidden lg:flex"
        } flex-col lg:flex-row lg:w-64 w-full lg:relative`}
      >
        <div className="lg:hidden flex justify-between items-center p-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white flex items-center gap-2"
          >
            <FaBars />
            <span>Menu</span>
          </button>
        </div>
        <div
          className={`flex flex-col lg:flex-col lg:space-y-2 space-y-2 lg:space-x-0 p-4 w-full`}
        >
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActivePage(link.label)}
              className={`flex items-center gap-2 lg:w-full px-4 py-2 rounded transition ${
                activePage === link.label ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              {link.icon}
              <span className="block lg:inline">{link.label}</span>
            </button>
          ))}
          <button
            onClick={() => setActivePage("Notifications")}
            className={`flex items-center gap-2 lg:w-full px-4 py-2 rounded transition ${
              activePage === "Notifications"
                ? "bg-gray-700"
                : "hover:bg-gray-700"
            }`}
          >
            <FaBell />
            <span className="block lg:inline">Notifications</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className={`flex-1 p-4 transition-all duration-300 ${
          isSidebarOpen ? "mt-16 lg:mt-0" : "mt-0"
        } lg:ml-64`}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold">Dashboard</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden text-white flex items-center gap-2 bg-gray-800 p-2 rounded"
          >
            {isSidebarOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
