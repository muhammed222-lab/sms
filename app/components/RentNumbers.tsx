"use client";

import React, { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const countryMap: { [key: string]: string } = {
  12: "United States",
  100: "United Kingdom",
  103: "Canada",
  106: "Nigeria",
  107: "India",
  115: "Germany",
  123: "France",
  126: "South Africa",
  128: "Australia",
  132: "Brazil",
  135: "China",
  141: "Japan",
  152: "Russia",
  263: "Mexico",
};

const currencyOptions = ["NGN", "USD", "EUR", "GBP", "CAD"];

interface Country {
  id: string;
  name_en: string;
  country_code: string;
}

interface RentalData {
  country_id: string;
  count: string;
  cost: string;
}

interface LimitItem {
  country_id: string;
  count: string;
  cost: string;
}

const RentNumbers: React.FC = () => {
  const API_BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "/api";

  const RENT_API_KEY = process.env.NEXT_PUBLIC_RENT_API_KEY;
  const EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/NGN";

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("hour");
  const [time, setTime] = useState<number>(1);
  const [rentalData, setRentalData] = useState<RentalData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [currency, setCurrency] = useState<string>("NGN");
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(EXCHANGE_API_URL);
        if (!response.ok) throw new Error("Failed to fetch exchange rates.");
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        setMessage("Failed to load exchange rates. Using default values.");
      }
    };

    fetchExchangeRates();
  }, []);

  const convertPrice = (priceInNaira: number): string => {
    const rate = exchangeRates[currency] || 1;
    const convertedPrice = priceInNaira * rate;
    return `${convertedPrice.toFixed(2)} ${currency}`;
  };

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/proxy-rent?action=limits&token=${RENT_API_KEY}&type=${duration}&time=${time}`
        );
        if (!response.ok) throw new Error("Failed to fetch countries");
        const data = await response.json();

        if (data.limits && Array.isArray(data.limits)) {
          const mappedCountries = data.limits.map((item: LimitItem) => ({
            id: item.country_id,
            name_en:
              countryMap[item.country_id] || `Country ID ${item.country_id}`,
            country_code: "unknown",
          }));
          setCountries(mappedCountries);
        } else {
          setCountries([]);
          setMessage("No countries available.");
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        setMessage("Failed to load countries. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [API_BASE_URL, duration, time, RENT_API_KEY]);

  useEffect(() => {
    if (!selectedCountry) return;

    const fetchRentalData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/proxy-rent?action=limits&token=${RENT_API_KEY}&country_id=${selectedCountry}&type=${duration}&time=${time}`
        );
        if (!response.ok) throw new Error("Failed to fetch rental data");
        const data = await response.json();

        if (data.limits && Array.isArray(data.limits)) {
          setRentalData(data.limits);
        } else {
          setRentalData([]);
          setMessage("No rental options available.");
        }
      } catch (error) {
        console.error("Error fetching rental data:", error);
        setMessage("Failed to load rental data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRentalData();
  }, [selectedCountry, duration, time, API_BASE_URL, RENT_API_KEY]);

  const handleRentClick = async (countryId: string) => {
    setMessage("");
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/proxy-rent?action=get-number&token=${RENT_API_KEY}&country_id=${countryId}&type=${duration}&time=${time}`
      );
      const data = await response.json();
      if (data.error) {
        setMessage(
          data.error.includes("balance")
            ? "Service temporarily unavailable due to insufficient funds on our end."
            : "Failed to rent a number. Please try again."
        );
      } else if (data.request_id) {
        setMessage(`Number rented successfully: ${data.number}`);
      } else {
        setMessage("Failed to rent a number. Please try again.");
      }
    } catch (error) {
      console.error("Error renting number:", error);
      setMessage("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col max-w-6xl mx-auto p-6 bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Rent New Number</h1>

      <div className="mb-4">
        <h3 className="font-bold">Select Currency:</h3>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border p-2 rounded"
        >
          {currencyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Country Selection */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-bold text-lg mb-4">1. Select Your Country</h2>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {countries.length ? (
              countries.map((country) => (
                <button
                  key={country.id}
                  className={`block w-full text-left p-2 rounded ${
                    selectedCountry === country.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedCountry(country.id)}
                >
                  {country.name_en}
                </button>
              ))
            ) : (
              <p className="text-gray-500">No countries available.</p>
            )}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-bold text-lg mb-4">2. Set Rent Duration</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {["hour", "day", "week", "month"].map((type) => (
              <button
                key={type}
                className={`w-full p-2 rounded ${
                  duration === type
                    ? "bg-blue-100 border border-blue-500"
                    : "bg-gray-50 hover:bg-gray-200"
                }`}
                onClick={() => setDuration(type)}
              >
                {type}
              </button>
            ))}
          </div>
          {duration === "hour" && (
            <div className="flex items-center justify-center">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
                onClick={() => setTime((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span className="px-6 py-2">{time}</span>
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
                onClick={() => setTime((prev) => prev + 1)}
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Rent a Number */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-bold text-lg mb-4">3. Rent a Number</h2>
          {loading ? (
            <div className="flex items-center justify-center">
              <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
            </div>
          ) : rentalData.length ? (
            rentalData.map((option) => (
              <div
                key={option.country_id}
                className="p-2 flex justify-between items-center border-b"
              >
                <span>{`Numbers: ${option.count}, Cost: ${convertPrice(
                  parseFloat(option.cost) * 1.05
                )}`}</span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => handleRentClick(option.country_id)}
                >
                  Rent
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No rental options available.</p>
          )}
        </div>
      </div>

      {message && (
        <div className="mt-4 text-center text-red-500">{message}</div>
      )}
    </div>
  );
};

export default RentNumbers;
