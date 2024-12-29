/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface Country {
  name_en: string;
  id: string;
  title: string;
}

interface Service {
  id: string;
  title: string;
}

interface RentalData {
  country_id: string;
  count: string;
  cost: string;
}

const RentNumbers = () => {
  const API_BASE_URL = "https://smsgolbe.net/api"; // Point to the actual API server
  const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN; // Use environment variable for API token

  const { user, isSignedIn } = useUser();
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [duration, setDuration] = useState<string>("hour");
  const [hours, setHours] = useState<number>(1);
  const [rentalData, setRentalData] = useState<RentalData[]>([]);
  const [searchCountry, setSearchCountry] = useState<string>("");
  const [searchService, setSearchService] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  const isFormValid = selectedCountry && selectedService;

  // Fetch balance from Firebase
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (isSignedIn && user) {
        try {
          const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
          console.log("Fetching balance for user email:", userEmail);

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

    fetchUserBalance();
  }, [isSignedIn, user]);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        console.log("Fetching countries...");
        const response = await fetch(
          `${API_BASE_URL}/countries?token=${API_TOKEN}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data: { [key: string]: Country } = await response.json();
        console.log("Countries fetched:", data);
        setCountries(Object.values(data));
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, [API_TOKEN]);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log("Fetching services...");
        const response = await fetch(
          `${API_BASE_URL}/services?token=${API_TOKEN}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data: { [key: string]: Service } = await response.json();
        console.log("Services fetched:", data);
        setServices(Object.values(data));
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, [API_TOKEN]);

  // Fetch rental data
  useEffect(() => {
    if (!selectedCountry || !selectedService) return;

    const fetchRentalData = async () => {
      setLoading(true);
      try {
        console.log("Fetching rental data...");
        const response = await fetch(
          `${API_BASE_URL}/limits?token=${API_TOKEN}&country_id=${selectedCountry}&application_id=${selectedService}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Rental data fetched:", data);
        if (Array.isArray(data)) {
          setRentalData(data);
        } else {
          console.error("Unexpected rental data format:", data);
          setRentalData([]);
        }
      } catch (error) {
        console.error("Error fetching rental data:", error);
        setRentalData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRentalData();
  }, [selectedCountry, selectedService, API_TOKEN]);

  const handleIncreaseHours = () => {
    setHours((prevHours) => prevHours + 1);
  };

  const handleDecreaseHours = () => {
    setHours((prevHours) => (prevHours > 1 ? prevHours - 1 : 1));
  };

  const handleRentClick = async (countryId: string, cost: number) => {
    if (balance < cost) {
      setMessage("Insufficient balance. Please top up your account.");
      return;
    }

    try {
      console.log("Renting number...");
      const response = await fetch(
        `${API_BASE_URL}/get-number?token=${API_TOKEN}&country_id=${countryId}&application_id=${selectedService}`
      );

      console.log(`Request URL: ${response.url}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      // Handle possible API response errors
      if (data.success === false) {
        if (data.error_code === "wrong_token") {
          setMessage("Invalid API token. Please check your API key.");
        } else if (data.error_code === "balance") {
          setMessage("Insufficient balance. Please top up and try again.");
        } else {
          setMessage("Server issue. Please try again later.");
        }
        return;
      }

      // Handle success
      if (data.request_id) {
        setMessage(`Number rented successfully: ${data.number}`);
        // Perform further logic to update balance and save the data
      } else {
        setMessage("Failed to rent a number. Please try again later.");
      }
    } catch (error) {
      console.error("Error renting number:", error);
      setMessage("Server issue. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white p-6 rounded-lg">
      {/* Left Section: Form */}
      <div className="flex-1 border-r pr-6">
        <h2 className="text-2xl font-bold mb-4">Rent Number</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Country</label>
          <div className="relative">
            <input
              type="text"
              className="border rounded px-4 py-2 w-full"
              placeholder="Search country..."
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
            />
            <select
              className="border rounded px-4 py-2 w-full mt-1"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              size={5}
            >
              <option value="">Select country</option>
              {countries
                .filter((country) =>
                  country.name_en
                    ? country.name_en
                        .toLowerCase()
                        .includes(searchCountry.toLowerCase())
                    : false
                )
                .map((country, index) => (
                  <option key={`${country.id}-${index}`} value={country.id}>
                    {country.name_en}
                  </option>
                ))}
            </select>
          </div>
          {selectedCountry && (
            <div className="mt-2">
              <span className="text-sm font-medium">Selected Country: </span>
              <span className="text-sm">
                {countries.find((c) => c.id === selectedCountry)?.name_en}
              </span>
              <button
                className="ml-2 text-red-500"
                onClick={() => setSelectedCountry("")}
              >
                x
              </button>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Service</label>
          <div className="relative">
            <input
              type="text"
              className="border rounded px-4 py-2 w-full"
              placeholder="Search service..."
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
            />
            <select
              className="border rounded px-4 py-2 w-full mt-1"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              size={5}
              disabled={!selectedCountry}
            >
              <option value="">Select service</option>
              {services
                .filter((service) =>
                  service.title
                    ? service.title
                        .toLowerCase()
                        .includes(searchService.toLowerCase())
                    : false
                )
                .map((service, index) => (
                  <option key={`${service.id}-${index}`} value={service.id}>
                    {service.title}
                  </option>
                ))}
            </select>
          </div>
          {selectedService && (
            <div className="mt-2">
              <span className="text-sm font-medium">Selected Service: </span>
              <span className="text-sm">
                {services.find((s) => s.id === selectedService)?.title}
              </span>
              <button
                className="ml-2 text-red-500"
                onClick={() => setSelectedService("")}
              >
                x
              </button>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Duration</label>
          <select
            className="border rounded px-4 py-2 w-full"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="hour">Hourly</option>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
        {duration === "hour" && (
          <div className="mb-4 flex items-center">
            <button
              className="px-4 py-2 bg-gray-200 rounded-l"
              onClick={handleDecreaseHours}
            >
              -
            </button>
            <input
              type="text"
              className="border-t border-b px-4 py-2 w-16 text-center"
              value={hours}
              readOnly
            />
            <button
              className="px-4 py-2 bg-gray-200 rounded-r"
              onClick={handleIncreaseHours}
            >
              +
            </button>
          </div>
        )}
        <button
          disabled={!isFormValid}
          className={`w-full py-2 px-4 mt-4 rounded ${
            isFormValid ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400"
          }`}
          onClick={() =>
            handleRentClick(
              selectedCountry,
              parseFloat(
                rentalData.find((data) => data.country_id === selectedCountry)
                  ?.cost || "0"
              )
            )
          }
        >
          Submit
        </button>
        {balance < 1000 && (
          <p className="text-red-500 mt-4">
            Balance too low, fund your account.
          </p>
        )}
      </div>

      {/* Right Section: Table */}
      <div className="flex-1 pl-6">
        <h2 className="text-2xl font-bold mb-4">Available Rentals</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full max-w-lg border-collapse border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-2 text-left">
                    Country
                  </th>
                  <th className="border border-gray-200 p-2 text-left">
                    Count
                  </th>
                  <th className="border border-gray-200 p-2 text-left">Cost</th>
                  <th className="border border-gray-200 p-2 text-left">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rentalData.map((num, index) => (
                  <tr
                    key={`${num.country_id}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border border-gray-200 p-2">
                      {num.country_id}
                    </td>
                    <td className="border border-gray-200 p-2">{num.count}</td>
                    <td className="border border-gray-200 p-2">{num.cost}</td>
                    <td className="border border-gray-200 p-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() =>
                          handleRentClick(num.country_id, parseFloat(num.cost))
                        }
                      >
                        Rent
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default RentNumbers;
