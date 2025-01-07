"use client";
import React, { useState } from "react";
import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb"; // Assuming you have a Breadcrumb component
import Sidebar from "../components/Sidebar";

const Settings = () => {
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("Light");

  return (
    <div className="min-h-screen p-6 w-[80%] m-auto">
      <Sidebar />
      <div className="flex">
        <main className="w-full p-6">
          <Breadcrumb items={[]} />
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p>Manage your settings here.</p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Language</h3>
              <select
                className="p-2 rounded-lg border"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <select
                className="p-2 rounded-lg border"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
