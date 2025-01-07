"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { FaClipboard } from "react-icons/fa";
import RecentSmsOrders from "./RecentSmsOrders";

const Sms = () => {
  const [user, setUser] = useState<any>(null);
  const [countries, setCountries] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [services, setServices] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [selectedCountry, setSelectedCountry] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [balance, setBalance] = useState(0);
  const [requestedNumber, setRequestedNumber] = useState<any>(null);
  const [smsCode, setSmsCode] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isFetchingCode, setIsFetchingCode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch Firebase user and balance
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userEmail = currentUser.email || "";
          const q = query(
            collection(db, "userDeposits"),
            where("email", "==", userEmail)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setBalance(userData.amount ?? 0);
          } else {
            setBalance(0);
          }
        } catch (error) {
          console.error("Error fetching user balance:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch countries and services
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const countriesResponse = await fetch(`/api/countries`);
        const countriesData = await countriesResponse.json();
        console.log("Countries Data:", countriesData);

        const servicesResponse = await fetch(`/api/services`);
        const servicesData = await servicesResponse.json();
        console.log("Services Data:", servicesData);

        // Convert object to array and map for Select
        const parsedCountries = (
          Object.values(countriesData) as { id: string; title: string }[]
        ).map((c) => ({
          label: c.title,
          value: c.id,
        }));
        setCountries(parsedCountries);

        const parsedServices = (
          Object.values(servicesData) as { id: string; title: string }[]
        ).map((s) => ({
          label: s.title,
          value: s.id,
        }));
        setServices(parsedServices);
      } catch (error) {
        console.error("Error fetching options:", error);
        setMessage({
          type: "error",
          content: "Error fetching data. Please check your connection.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleRequestNumber = async () => {
    if (!selectedCountry || !selectedService) {
      setMessage({
        type: "error",
        content: "Please select a country and a service.",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/get-number?country_id=${selectedCountry.value}&application_id=${selectedService.value}`
      );
      if (!response.ok) {
        throw new Error("Failed to request a number");
      }
      const data = await response.json();
      setRequestedNumber(data);
      setMessage({
        type: "success",
        content: `Number fetched: ${data.number}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error requesting number:", error.message);
      } else {
        console.error("Error requesting number:", error);
      }
      setMessage({ type: "error", content: (error as Error).message });
    }
  };

  const fetchSmsCode = async () => {
    if (!requestedNumber) {
      setMessage({ type: "error", content: "No requested number found." });
      return;
    }

    setIsFetchingCode(true);

    try {
      const response = await fetch(
        `/api/get-sms?request_id=${requestedNumber.request_id}`
      );
      const data = await response.json();

      if (data.error_msg === "Still waiting...") {
        setMessage({ type: "info", content: "Still waiting for SMS..." });
      } else if (data.sms_code) {
        setSmsCode(data.sms_code);
        setMessage({ type: "success", content: "SMS code received." });
      }
    } catch (error) {
      console.error("Error fetching SMS code:", error);
      setMessage({ type: "error", content: "Error fetching SMS code." });
    } finally {
      setIsFetchingCode(false);
    }
  };

  return (
    <div className="bg-white border p-4 rounded-lg max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">New SMS</h2>
      {message.content && (
        <div
          className={`p-2 mb-4 rounded text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-600"
              : message.type === "success"
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {message.content}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a country
        </label>
        <Select
          options={countries}
          value={selectedCountry}
          onChange={setSelectedCountry}
          placeholder="Search by country..."
          isLoading={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a service
        </label>
        <Select
          options={services}
          value={selectedService}
          onChange={setSelectedService}
          placeholder="Search by service..."
          isLoading={loading}
        />
      </div>

      <button
        onClick={handleRequestNumber}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        Get Number
      </button>

      {requestedNumber && (
        <div className="mt-4">
          <p className="text-sm">Phone Number: {requestedNumber.number}</p>
          <button
            onClick={() =>
              navigator.clipboard.writeText(requestedNumber.number)
            }
            className="text-blue-500 text-sm flex items-center gap-1"
          >
            <FaClipboard /> Copy
          </button>

          <button
            onClick={fetchSmsCode}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={isFetchingCode}
          >
            {isFetchingCode ? "Waiting for Code..." : "Fetch SMS Code"}
          </button>

          {smsCode && <p className="text-sm mt-2">SMS Code: {smsCode}</p>}
        </div>
      )}
      <RecentSmsOrders />
    </div>
  );
};

export default Sms;
