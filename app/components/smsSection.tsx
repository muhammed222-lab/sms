"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import { FiSettings } from "react-icons/fi";

interface PriceEntry {
  cost: number;
  count: number;
  rate: number;
}

interface ServiceItem {
  // We combine the country, category, and product for display purposes.
  name: string;
  basePrice: number; // from API (assumed in USD)
  currency: string; // we assume "USD"
}

// This function fetches services directly from the 5sim API endpoint.
async function fetchServices(): Promise<ServiceItem[]> {
  const res = await fetch("https://5sim.net/v1/guest/prices", {
    headers: { Accept: "application/json" },
  });
  const data = (await res.json()) as Record<
    string,
    Record<string, Record<string, PriceEntry>>
  >;
  const services: ServiceItem[] = [];
  // Flatten the nested API response
  Object.keys(data).forEach((country) => {
    Object.keys(data[country]).forEach((category) => {
      Object.keys(data[country][category]).forEach((product) => {
        const entry = data[country][category][product];
        services.push({
          name: `${country} | ${category} | ${product}`,
          basePrice: entry.cost,
          currency: "USD",
        });
      });
    });
  });
  return services;
}

// Fetch exchange rate from baseCurrency to targetCurrency using exchangerate.host.
async function fetchExchangeRate(
  baseCurrency: string,
  targetCurrency: string
): Promise<number> {
  const res = await fetch(
    `https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${targetCurrency}`
  );
  const data = await res.json();
  // If for some reason the rate is missing, fallback to 1.
  return data.rates?.[targetCurrency] ?? 1;
}

const PricesTable: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [preferredAreaCode, setPreferredAreaCode] = useState<string>("");
  const [preferredCarrier, setPreferredCarrier] = useState<string>("");
  const [preferredPhone, setPreferredPhone] = useState<string>("");

  // Assume the API returns prices in USD.
  const baseCurrency = "USD";
  // Change targetCurrency to your desired display currency (e.g. EUR).
  const targetCurrency = "EUR";

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, rate] = await Promise.all([
          fetchServices(),
          fetchExchangeRate(baseCurrency, targetCurrency),
        ]);
        setServices(servicesData);
        setExchangeRate(rate);
      } catch (error) {
        console.error("Error loading data", error);
      }
    }
    loadData();
  }, [baseCurrency, targetCurrency]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleSettings = () => {
    setSettingsVisible((prev) => !prev);
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate price multiplier: each non-empty setting increases price by 20%
  let multiplier = 1;
  if (preferredAreaCode.trim() !== "") multiplier *= 1.2;
  if (preferredCarrier.trim() !== "") multiplier *= 1.2;
  if (preferredPhone.trim() !== "") multiplier *= 1.2;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Services and Prices</h2>
      {/* Search and settings toggle */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-1 py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={toggleSettings}
          className="ml-2 p-2 text-xl text-gray-600 hover:text-gray-800"
          title="Settings"
        >
          <FiSettings />
        </button>
      </div>

      {/* Settings panel */}
      {settingsVisible && (
        <div className="mb-4 p-4 border border-gray-300 rounded">
          <div className="mb-2">
            <label className="mr-2 font-medium">Preferred Area Code:</label>
            <input
              type="text"
              value={preferredAreaCode}
              onChange={(e) => setPreferredAreaCode(e.target.value)}
              placeholder="e.g. 212"
              className="py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-2">
            <label className="mr-2 font-medium">Preferred Carrier:</label>
            <input
              type="text"
              value={preferredCarrier}
              onChange={(e) => setPreferredCarrier(e.target.value)}
              placeholder="e.g. tmo, vz, att"
              className="py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mr-2 font-medium">Preferred Phone:</label>
            <input
              type="text"
              value={preferredPhone}
              onChange={(e) => setPreferredPhone(e.target.value)}
              placeholder="e.g. 1112223333"
              className="py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Each non‑empty setting increases the price by <strong>20%</strong>.
          </p>
        </div>
      )}

      {/* Scrollable table */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                Service
              </th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                Base Price ({baseCurrency})
              </th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                Price ({targetCurrency})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredServices.map((item, index) => {
              const convertedPrice = item.basePrice * exchangeRate;
              const finalPrice = convertedPrice * multiplier;
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 text-sm text-gray-800">
                    {item.name}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-800">
                    {item.basePrice.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-800">
                    {finalPrice.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PricesTable;
