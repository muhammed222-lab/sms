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
  FaHistory,
} from "react-icons/fa";
import DashboardBalance from "../components/DashboardBalance";
import RentNumbers from "../components/RentNumbers";
import Feedback from "../components/Feedback";
import Profile from "../components/profile";
import Tutor from "../components/Tutor";
import History from "../components/history";
import Sms from "../components/Sms";
import Header from "../components/header";
import Auth from "../components/Auth";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("Receive SMS");

  // Sidebar links data
  const sidebarLinks = [
    { label: "Receive SMS", id: "sms", icon: <FaSms /> },
    { label: "Rent Numbers", id: "rent", icon: <FaMobileAlt /> },
    { label: "Profile", id: "profile", icon: <FaUser /> },
    { label: "History", id: "history", icon: <FaHistory /> },
    { label: "Top Up Balance", id: "balance", icon: <FaWallet /> },
    { label: "Instructions", id: "instructions", icon: <FaInfoCircle /> },
    { label: "Feedback", id: "feedback", icon: <FaCommentDots /> },
  ];

  // Render content based on the active tab
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
      case "History":
        return <History />;
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

  // Save active page to localStorage whenever it changes
  useEffect(() => {
    const storedPage = localStorage.getItem("activePage");
    if (storedPage) {
      setActivePage(storedPage); // Set active page from localStorage
    }
  }, []);

  const handleTabChange = (label: string) => {
    setActivePage(label);
    localStorage.setItem("activePage", label); // Store the active page in localStorage
  };

  return (
    <>
      <Header />
      <Auth />
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
                onClick={() => handleTabChange(link.label)}
                className={`flex items-center gap-2 lg:w-full px-4 py-2 rounded transition ${
                  activePage === link.label
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
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
    </>
  );
};

export default Dashboard;
