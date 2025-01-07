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
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import Select from "react-select";
import DashboardBalance from "../components/DashboardBalance";
import RentNumbers from "../components/RentNumbers";
import Feedback from "../components/Feedback";
import Profile from "../components/profile";
import Tutor from "../components/Tutor";
import Sms from "../components/Sms";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("Receive SMS");
  const [balance, setBalance] = useState(0);
  const [services, setServices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [requestedNumber, setRequestedNumber] = useState(null);
  const [smsCode, setSmsCode] = useState("");

  const sidebarLinks = [
    { label: "Receive SMS", id: "sms", icon: <FaSms /> },
    { label: "Rent Numbers", id: "rent", icon: <FaMobileAlt /> },
    { label: "Profile", id: "profile", icon: <FaUser /> },
    { label: "Top Up Balance", id: "balance", icon: <FaWallet /> },
    { label: "Instructions", id: "instructions", icon: <FaInfoCircle /> },
    { label: "Feedback", id: "feedback", icon: <FaCommentDots /> },
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/balance");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setBalance(data.balance || 0);
        } else {
          throw new Error(
            "Expected JSON response but received something else."
          );
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    const fetchCountries = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/countries");
        const data = await response.json();
        setCountries(
          Object.values(data).map((c) => ({ label: c.title, value: c.id }))
        );
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/services");
        const data = await response.json();
        setServices(
          Object.values(data).map((s) => ({ label: s.title, value: s.id }))
        );
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchBalance();
    fetchCountries();
    fetchServices();
  }, []);

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
