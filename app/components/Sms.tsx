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

import countryList from "../../api/countryList.json"; // Import country list
import servicesList from "../../api/servicesList.json"; // Import service list

// Define proper interfaces for Country and Service
interface User {
  email: string | null;
  displayName: string | null;
}

interface Country {
  title: string;
  id: string;
}

interface Service {
  title: string;
  id: string;
  code: string;
  price?: number;
}

interface SelectOption {
  label: string;
  value: string;
}

interface RequestedNumber {
  request_id: string;
  number: string;
}

const Sms = () => {
  const [user, setUser] = useState<User | null>(null);
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [services, setServices] = useState<
    Array<SelectOption & { price: number }>
  >([]);
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  );
  const [selectedService, setSelectedService] = useState<
    SelectOption & { price: number }
  >();
  const [requestedNumber, setRequestedNumber] =
    useState<RequestedNumber | null>(null);
  const [smsCode, setSmsCode] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isFetchingCode, setIsFetchingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  // Fetch Firebase user and balance
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email || null,
          displayName: currentUser.displayName || null,
        });

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

  // Load countries and services from local JSON
  useEffect(() => {
    setLoading(true);

    try {
      const parsedCountries = Object.values(countryList).map(
        (country: Country) => ({
          label: country.title,
          value: country.id,
        })
      );
      setCountries(parsedCountries);

      const parsedServices = Object.values(servicesList).map(
        (service: Service) => ({
          label: service.title,
          value: service.id,
          price: service.price || 0,
        })
      );
      setServices(parsedServices);
    } catch (error) {
      console.error("Error loading local data:", error);
      setMessage({
        type: "error",
        content: "Error loading local data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRequestNumber = async () => {
    if (!selectedCountry || !selectedService) {
      setMessage({
        type: "error",
        content: "Please select a country and a service.",
      });
      return;
    }

    const servicePriceWithCommission = selectedService.price * 1.05;

    if (balance < servicePriceWithCommission) {
      setMessage({
        type: "error",
        content: "Insufficient balance. Please top up your account.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const response = await fetch(
        `/api/proxy-sms?action=get-number&country_id=${selectedCountry.value}&application_id=${selectedService.value}`
      );

      const data = await response.json();

      if (data.error_code === "balance") {
        setMessage({
          type: "error",
          content:
            "Service is temporarily unavailable due to insufficient funds on our end. We apologize for the inconvenience.",
        });
        return;
      }

      if (data.number) {
        setRequestedNumber(data);
        setMessage({
          type: "success",
          content: `Number fetched successfully: ${data.number}`,
        });

        const newBalance = balance - servicePriceWithCommission;
        setBalance(newBalance);

        if (user?.email) {
          const q = query(
            collection(db, "userDeposits"),
            where("email", "==", user.email)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDocRef = querySnapshot.docs[0].ref;
            await updateDoc(userDocRef, { amount: newBalance });
          }
        }
      } else {
        throw new Error("Failed to fetch number.");
      }
    } catch (error) {
      console.error("Error requesting number:", error);
      setMessage({
        type: "error",
        content: "Failed to request a number. Please try again later.",
      });
    } finally {
      setLoading(false);
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
        `/api/proxy-sms?action=get-sms&request_id=${requestedNumber.request_id}`
      );
      const data = await response.json();

      if (data.sms_code) {
        setSmsCode(data.sms_code);
        setMessage({ type: "success", content: "SMS code received." });
      } else if (data.error_code === "wait_sms") {
        setMessage({
          type: "info",
          content: "Waiting for SMS. Please check back shortly.",
        });
      } else {
        throw new Error(data.error || "Failed to fetch SMS.");
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
          onChange={(option) =>
            setSelectedService(option as (typeof services)[0])
          }
          placeholder="Search by service..."
          isLoading={loading}
        />
      </div>

      <button
        onClick={handleRequestNumber}
        className={`bg-blue-500 text-white px-4 py-2 rounded ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        }`}
        disabled={loading}
      >
        {loading ? "Processing..." : "Get Number"}
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
