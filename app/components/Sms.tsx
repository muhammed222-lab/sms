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

interface User {
  email: string | null;
  displayName: string | null;
}

interface RequestedNumber {
  request_id: string;
  number: string;
}

const Sms = () => {
  const [user, setUser] = useState<User | null>(null);
  const [countries, setCountries] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [services, setServices] = useState<
    Array<{ label: string; value: string; price: number }>
  >([]);
  const [selectedCountry, setSelectedCountry] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<{
    label: string;
    value: string;
    price: number;
  } | null>(null);
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

  // Fetch countries and services
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const countriesResponse = await fetch(`/api/countries`);
        const countriesData = await countriesResponse.json();

        const servicesResponse = await fetch(`/api/services`);
        const servicesData = await servicesResponse.json();

        // Convert object to array and map for Select
        const parsedCountries = (
          Object.values(countriesData) as { id: string; title: string }[]
        ).map((c) => ({
          label: c.title,
          value: c.id,
        }));
        setCountries(parsedCountries);

        const parsedServices = (
          Object.values(servicesData) as {
            id: string;
            title: string;
            price: number;
          }[]
        ).map((s) => ({
          label: `${s.title} - $${(s.price * 1.05).toFixed(2)}`, // Add 5% commission
          value: s.id,
          price: s.price * 1.05,
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

    if (balance < selectedService.price) {
      setMessage({
        type: "error",
        content: "Insufficient balance. Please top up your account.",
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

      // Deduct the price from the user's balance
      setBalance((prevBalance) => prevBalance - selectedService.price);

      setMessage({
        type: "success",
        content: `Number fetched: ${data.number}`,
      });

      // Update the balance in Firestore
      if (user?.email) {
        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDocRef = querySnapshot.docs[0].ref;
          await updateDoc(userDocRef, {
            amount: balance - selectedService.price,
          });
        }
      }
    } catch (error) {
      console.error("Error requesting number:", error);
      setMessage({ type: "error", content: "Failed to request a number." });
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
