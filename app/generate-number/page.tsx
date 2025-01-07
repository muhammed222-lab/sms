"use client";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const GenerateNumber = () => {
  const [services, setServices] = useState([
    { name: "Facebook", additionalCost: 0.77 },
    { name: "WhatsApp", additionalCost: 0.34 },
    { name: "General SMS", additionalCost: 1 },
  ]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [quantity, setQuantity] = useState(1); // Numbers to generate
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [userCurrency, setUserCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState({});
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [savedNumbers, setSavedNumbers] = useState([]);
  const basePrice = 3.5; // Fixed base price in USD

  // Fetch countries, exchange rates, and detect user location
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch country data
        const countryRes = await fetch("https://restcountries.com/v3.1/all");
        const countryData = await countryRes.json();
        const formattedCountries = countryData.map((country) => ({
          name: country.name.common,
          dialCode:
            country.idd.root +
            (country.idd.suffixes ? country.idd.suffixes[0] : ""),
          currency: country.currencies
            ? Object.keys(country.currencies)[0]
            : "USD",
        }));
        setCountries(formattedCountries);

        // Fetch user's location
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();
        const userCountry = formattedCountries.find(
          (c) => c.name === ipData.country_name
        );
        if (userCountry) {
          setCountry(userCountry.name);
          setCountryCode(userCountry.dialCode);
          setUserCurrency(userCountry.currency);
        }

        // Fetch exchange rates
        const rateRes = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const rateData = await rateRes.json();
        setExchangeRates(rateData.rates);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Generate Numbers
  const generateNumbers = async () => {
    const numbers = [];
    for (let i = 0; i < quantity; i++) {
      const id = Math.floor(Math.random() * 100000);

      // Fetch a valid phone number from an API
      const phoneRes = await fetch(
        `https://randommer.io/api/Phone/Generate?countryCode=${countryCode}&quantity=1`,
        {
          headers: {
            "X-Api-Key": "1cdf1305b63f4a92addf53db5020184c", // Replace with your API key
          },
        }
      );
      const phoneData = await phoneRes.json();
      const validPhoneNumber = phoneData[0];

      const availability = Math.random() > 0.3; // Random availability status

      selectedServices.forEach((service) => {
        const serviceData = services.find((s) => s.name === service);
        const totalPrice = basePrice + serviceData.additionalCost;
        const convertedPrice = totalPrice * (exchangeRates[userCurrency] || 1);

        const formattedCost = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: userCurrency,
        }).format(convertedPrice);

        numbers.push({
          id: `${id}-${service}`,
          service,
          phone: validPhoneNumber,
          cost: formattedCost,
          availability,
        });
      });
    }
    setGeneratedNumbers(numbers);
  };

  // Save Number
  const saveNumber = (number) => {
    setSavedNumbers([...savedNumbers, number]);
    alert(`Number ${number.phone} saved successfully!`);
  };

  return (
    <div className="min-h-screen p-6 w-[80%] m-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Generate Virtual Number
      </h1>

      {/* Service Selection & Quantity */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2 text-lg font-semibold">
            Select Services
          </label>
          {services.map((service, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={service.name}
                value={service.name}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedServices([...selectedServices, service.name]);
                  } else {
                    setSelectedServices(
                      selectedServices.filter((s) => s !== service.name)
                    );
                  }
                }}
              />
              <label htmlFor={service.name} className="ml-2">
                {service.name}
              </label>
            </div>
          ))}
        </div>
        <div>
          <label className="block mb-2 text-lg font-semibold">
            Number of Numbers
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Country Selection */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2 text-lg font-semibold">Country</label>
          <select
            className="w-full p-2 border rounded"
            value={country}
            onChange={(e) => {
              const selected = countries.find((c) => c.name === e.target.value);
              setCountry(selected.name);
              setCountryCode(selected.dialCode);
              setUserCurrency(selected.currency);
            }}
          >
            {countries.map((c, index) => (
              <option key={index} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-lg font-semibold">
            Country Code
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={countryCode}
            disabled
          />
        </div>
      </div>

      {/* Generate Numbers */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={generateNumbers}
        disabled={!selectedServices.length || !country}
      >
        Generate Numbers
      </button>

      {/* Generated Numbers Table */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Generated Numbers</h2>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Service</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Cost</th>
              <th className="border p-2">Availability</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {generatedNumbers.map((num, index) => (
              <tr key={index}>
                <td className="border p-2">{num.id}</td>
                <td className="border p-2">{num.service}</td>
                <td className="border p-2">{num.phone}</td>
                <td className="border p-2">{num.cost}</td>
                <td className="border p-2 text-center">
                  {num.availability ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </td>
                <td className="border p-2 text-center">
                  {num.availability && (
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded"
                      onClick={() => saveNumber(num)}
                    >
                      Buy
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenerateNumber;
