/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import { FaGlobe } from "react-icons/fa";
import clsx from "clsx";

// Country to ISO code mapping
const countryIsoMap: Record<string, string> = {
  "united states": "us",
  russia: "ru",
  argentina: "ar",
  algeria: "dz",
  australia: "au",
  austria: "at",
};

// Get country flag URL using flagcdn.com
const getFlagUrl = (country: string) => {
  const key = country.trim().toLowerCase();
  const iso = countryIsoMap[key] || key;
  return `https://flagcdn.com/w40/${iso}.png`;
};

// Interfaces for API response
interface PriceEntry {
  cost: number;
  count: number;
  rate: number;
}

interface PriceItem extends PriceEntry {
  country: string;
  category: string;
  product: string;
}

const PricesPage: React.FC = () => {
  const [pricesData, setPricesData] = useState<
    Record<string, Record<string, Record<string, PriceEntry>>>
  >({});
  const [flattenedData, setFlattenedData] = useState<PriceItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"country" | "service">("country");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [rubToUsdRate, setRubToUsdRate] = useState(1);

  // Fetch SMS pricing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/getsms/countries");
        if (!res.ok) throw new Error("Failed to fetch SMS pricing data.");
        const data = await res.json();
        setPricesData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Flatten nested data into an array
  useEffect(() => {
    const flat: PriceItem[] = [];
    Object.keys(pricesData).forEach((country) => {
      Object.keys(pricesData[country]).forEach((category) => {
        Object.keys(pricesData[country][category]).forEach((product) => {
          const entry = pricesData[country][category][product];
          flat.push({ country, category, product, ...entry });
        });
      });
    });
    setFlattenedData(flat);
  }, [pricesData]);

  // Fetch RUB to USD exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/RUB"
        );
        if (!res.ok) throw new Error("Failed to fetch exchange rates.");
        const data = await res.json();
        setRubToUsdRate(data.rates?.USD ?? 1);
      } catch (err) {
        console.error("Failed to fetch exchange rates:", err);
      }
    };
    fetchExchangeRate();
  }, []);

  // Debounce search term to reduce filtering on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filtered data based on active tab
  const filteredData = flattenedData.filter((item) => {
    if (activeTab === "country") {
      return (
        item.country
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    } else {
      const matchCountry = selectedCountry
        ? item.country.toLowerCase() === selectedCountry.toLowerCase()
        : true;
      const matchService = serviceSearch
        ? item.product.toLowerCase().includes(serviceSearch.toLowerCase())
        : true;
      return matchCountry && matchService;
    }
  });

  // Convert RUB cost to USD with 50% markup
  const convertCostToUSDWithMarkup = (cost: number): string => {
    const validCost = typeof cost === "number" ? cost : 0;
    const costWithMarkup = validCost * 1.5; // Adding 50% markup
    const costInUSD = costWithMarkup * rubToUsdRate;
    return `$${costInUSD.toFixed(2)} USD`;
  };

  const renderCountryIcon = (country: string) => (
    <img
      src={getFlagUrl(country)}
      alt={country}
      className="w-5 h-5 inline-block mr-2 rounded"
      onError={(e) =>
        ((e.target as HTMLImageElement).src =
          "https://dummyimage.com/20x20/eeeeee/aaaaaa.png")
      }
    />
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Customer Prices</h1>

      {/* Tabs */}
      <div className="flex mb-6">
        {["country", "service"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "country" | "service")}
            className={clsx(
              "flex-1 py-3 text-center font-semibold border-b-4",
              {
                "border-green-500 text-green-500": activeTab === tab,
                "border-transparent text-gray-500": activeTab !== tab,
              }
            )}
          >
            By {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by country or service..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded shadow-sm mb-4"
      />

      {/* Prices Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border shadow-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 border">Country</th>
              <th className="px-4 py-3 border">Service</th>
              <th className="px-4 py-3 border">Price (USD)</th>
              <th className="px-4 py-3 border">Stock</th>
              <th className="px-4 py-3 border">Count</th>
              <th className="px-4 py-3 border">Rate</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, visibleCount).map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 text-center">
                <td className="px-4 py-3 flex items-center justify-center">
                  {renderCountryIcon(item.country)}
                  {item.country.toUpperCase()}
                </td>
                <td className="px-4 py-3">{item.product}</td>
                <td className="px-4 py-3">
                  {convertCostToUSDWithMarkup(item.cost)}
                </td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">{item.count}</td>
                <td className="px-4 py-3">{item.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* See More Button */}
      {visibleCount < filteredData.length && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setVisibleCount(visibleCount + 50)}
            className="px-6 py-2 text-white bg-green-600 rounded shadow-md hover:bg-green-700"
          >
            See More
          </button>
        </div>
      )}

      {/* Loading and Error States */}
      {loading && <div>Loading prices...</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
};

export default PricesPage;
