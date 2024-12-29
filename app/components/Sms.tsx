/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import RecentSmsOrders from "./RecentSmsOrders";
// import PricesTable from "../test/page";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FaClipboard } from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

interface Price {
  countryId: string;
  serviceId: string;
  cost: string;
  count: number;
}

interface Service {
  name: string;
  id: string;
  label: string;
}

const Sms = () => {
  const { user, isSignedIn } = useUser();
  interface Country {
    label: string;
    value: string;
  }

  interface Message {
    type: "error" | "success";
    content: string;
  }

  const [countries, setCountries] = useState<Country[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [balance, setBalance] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  interface Limit {
    country_id: string;
    application_id: string;
    numbers: number;
  }

  const [limits, setLimits] = useState<Limit[]>([]);
  // const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  interface Order {
    orderId: string;
    number: string;
    code: string;
    country: string;
    service: string;
    provider: string;
    amount: string;
    status: string;
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  interface RequestedNumber {
    request_id: string;
    number: string;
    cost: string;
  }

  const [requestedNumber, setRequestedNumber] =
    useState<RequestedNumber | null>(null);
  const [smsCode, setSmsCode] = useState("");

  const itemsPerPage = 10;

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (isSignedIn && user) {
        try {
          const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
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
      }
    };

    fetchBalance();
  }, [isSignedIn, user]);

  // Fetch countries, services, and prices
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [countriesRes, servicesRes, pricesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/countries`),
          fetch(`${API_BASE_URL}/services`),
          fetch(`${API_BASE_URL}/prices`),
        ]);

        const countriesData: { name_en: string; id: string }[] =
          await countriesRes.json();
        const servicesData: Service[] = await servicesRes.json();
        const pricesData = await pricesRes.json();

        Object.values(countriesData).map((c: any) => ({
          label: c.name_en as string,
          value: c.id as string,
        }));
        setCountries(
          Object.values(countriesData).map((c) => ({
            label: c.name_en,
            value: c.id,
          }))
        );

        setServices(
          Object.values(servicesData).map((s) => ({
            name: s.name,
            id: s.id,
            label: s.name, // Assuming label is the same as name
          }))
        );

        const pricesWithoutMarkup = Object.entries(pricesData)
          .map(([countryId, services]) => {
            return Object.entries(
              services as { [key: string]: { cost: string; count: number } }
            ).map(([serviceId, { cost, count }]) => ({
              countryId,
              serviceId,
              cost: parseFloat(cost).toFixed(2),
              count,
            }));
          })
          .flat();

        setPrices(pricesWithoutMarkup);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch limits
  const fetchLimits = async () => {
    if (!selectedCountry || !selectedService) {
      setMessage({
        type: "error",
        content: "Please select a country and a service.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/limits?country_id=${selectedCountry.value}&application_id=${selectedService.id}`
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setLimits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching limits:", error);
      setMessage({
        type: "error",
        content: "Error fetching limits. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Request phone number
  const requestPhoneNumber = async () => {
    if (!selectedCountry || !selectedService) {
      setMessage({
        type: "error",
        content: "Please select a country and a service.",
      });
      return;
    }

    if (balance < 1000) {
      setMessage({
        type: "error",
        content: "Insufficient balance. Please fund your account.",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/get-number?country_id=${selectedCountry.value}&application_id=${selectedService.id}`
      );
      const data = await response.json();

      if (data.error) {
        if (data.error === "NO_BALANCE") {
          setMessage({
            type: "error",
            content: "Sorry for the inconvenience, please try again later.",
          });
        } else {
          setMessage({
            type: "error",
            content: "Error requesting number.",
          });
        }
        throw new Error(data.error);
      }

      if (!data.number || !data.cost) {
        setMessage({
          type: "error",
          content: "Sorry, something went wrong. Please try again later.",
        });
        return;
      }

      setRequestedNumber(data);
      setSmsCode("");
      setMessage({
        type: "success",
        content: `Phone number requested successfully: ${data.number}`,
      });

      // Deduct balance
      const newBalance = balance - parseFloat(data.cost);
      setBalance(newBalance);
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
      const q = query(
        collection(db, "userDeposits"),
        where("email", "==", userEmail)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { amount: newBalance });
      }

      // Automatically fetch SMS code
      const intervalId = setInterval(async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/get-sms?request_id=${data.request_id}`
          );
          const smsData = await response.json();
          if (smsData.error) throw new Error(smsData.error);

          if (smsData.sms_code) {
            setSmsCode(smsData.sms_code);
            setMessage({
              type: "success",
              content: `SMS Code received: ${smsData.sms_code}`,
            });
            clearInterval(intervalId);

            // Add order to orders list
            setOrders((prevOrders) => [
              ...prevOrders,
              {
                orderId: data.request_id,
                number: data.number,
                code: smsData.sms_code,
                country: selectedCountry.label,
                service: selectedService.label,
                provider: "Sms-man",
                amount: data.cost,
                status: "Completed",
              },
            ]);
          }
        } catch (error) {
          console.error("Error fetching SMS code:", error);
        }
      }, 5000); // Poll every 5 seconds
    } catch (error) {
      console.error("Error requesting number:", error);
    }
  };

  // Fetch SMS code
  const fetchSmsCode = async () => {
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
        `${API_BASE_URL}/get-sms?request_id=${requestedNumber.request_id}`
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setSmsCode(data.sms_code || "Still waiting for SMS...");
      setMessage({
        type: "success",
        content: `SMS Code received: ${data.sms_code || "Still waiting..."}`,
      });
    } catch (error) {
      console.error("Error fetching SMS code:", error);
      setMessage({ type: "error", content: "Error fetching SMS code." });
    }
  };

  // Pagination logic
  const filteredPrices = prices.filter((price) => {
    const country = countries.find((c) => c.value === price.countryId);
    return country?.label?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrices = filteredPrices.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredPrices.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: "success", content: "Number copied to clipboard!" });
  };

  return (
    <div className="bg-white border p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Receive SMS</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Select Country:
          </label>
          <Select
            options={countries}
            onChange={setSelectedCountry}
            placeholder="Search and select a country"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Select Service:
          </label>
          <Select
            options={services}
            onChange={setSelectedService}
            placeholder="Search and select a service"
          />
        </div>
      </div>

      <button
        onClick={fetchLimits}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Get Limits
      </button>

      {Array.isArray(limits) && limits.length > 0 && (
        <div className="mt-4 p-4 border rounded bg-blue-50">
          <h4 className="text-lg font-bold">Limits</h4>
          {limits.map((limit, index) => (
            <p key={index}>
              {`Country ID: ${limit.country_id}, Service ID: ${limit.application_id}, Numbers: ${limit.numbers}`}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={requestPhoneNumber}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Request Phone Number
      </button>

      {requestedNumber && (
        <div className="mt-4 p-4 border rounded bg-blue-50">
          <h4 className="text-lg font-bold">Requested Number</h4>
          <p>{requestedNumber.number}</p>
          <button
            onClick={() => copyToClipboard(requestedNumber.number)}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-2 flex items-center"
          >
            <FaClipboard className="mr-2" /> Copy Number
          </button>
          <button
            onClick={fetchSmsCode}
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          >
            Fetch SMS Code
          </button>
          {smsCode && (
            <p className="mt-2 font-medium text-lg">
              Received Code: <span className="text-green-700">{smsCode}</span>
            </p>
          )}
        </div>
      )}

      {message && (
        <div
          className={`p-4 mb-4 mt-4 rounded ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <p>{message.content}</p>
        </div>
      )}

      <RecentSmsOrders />
      {/* <PricesTable selectedCountry={selectedCountry} token={API_TOKEN} /> */}

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">
          Available Countries - {countries.length}
        </h3>
        {prices.length > 0 && (
          <input
            type="text"
            placeholder="Search countries..."
            className="mb-4 p-2 border rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}

        {currentPrices.map((price, index) => (
          <div key={index} className="border p-2 rounded mb-2">
            <p>
              Country:{" "}
              {countries.find((c) => c.value === price.countryId)?.label}
            </p>
            <p>Service ID: {price.serviceId}</p>
            <p>Cost: ${price.cost}</p>
            <p>Available Numbers: {price.count}</p>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={
              currentPage === Math.ceil(filteredPrices.length / itemsPerPage)
            }
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Order History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Order ID</th>
                <th className="py-2 px-4 border-b">Number</th>
                <th className="py-2 px-4 border-b">Code</th>
                <th className="py-2 px-4 border-b">Country</th>
                <th className="py-2 px-4 border-b">Service</th>
                <th className="py-2 px-4 border-b">Provider</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{order.orderId}</td>
                  <td className="py-2 px-4 border-b">{order.number}</td>
                  <td className="py-2 px-4 border-b">{order.code}</td>
                  <td className="py-2 px-4 border-b">{order.country}</td>
                  <td className="py-2 px-4 border-b">{order.service}</td>
                  <td className="py-2 px-4 border-b">{order.provider}</td>
                  <td className="py-2 px-4 border-b">${order.amount}</td>
                  <td className="py-2 px-4 border-b">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sms;
function setLoading(_arg0: boolean) {
  throw new Error("Function not implemented.");
}
