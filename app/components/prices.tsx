/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import { FaGlobe } from "react-icons/fa";

// A small mapping from country name to ISO code (in lowercase)
// Extend this mapping with additional countries as needed.
const countryIsoMap: Record<string, string> = {
  "united states": "us",
  russia: "ru",
  argentina: "ar",
  algeria: "dz",
  australia: "au",
  austria: "at",
  // add more mappings here
};

const getFlagUrl = (country: string) => {
  const key = country.trim().toLowerCase();
  const iso = countryIsoMap[key] || key;
  // Use flagcdn.com for a reliable flag image.
  return `https://flagcdn.com/w40/${iso}.png`;
};

// Interfaces matching our API response
interface PriceEntry {
  cost: number;
  count: number;
  rate: number;
}

interface PriceItem extends PriceEntry {
  country: string;
  category: string; // used as "Stock"
  product: string; // service name
}

const PricesPage: React.FC = () => {
  // Data states
  const [pricesData, setPricesData] = useState<
    Record<string, Record<string, Record<string, PriceEntry>>>
  >({} as Record<string, Record<string, Record<string, PriceEntry>>>);
  const [flattenedData, setFlattenedData] = useState<PriceItem[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and tabs
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"country" | "service">("country");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [serviceSearch, setServiceSearch] = useState<string>("");

  // Exchange rate state (assume prices in NGN; convert to USD)
  const [ngnRate, setNgnRate] = useState<number>(0);

  // Fetch data from /api/getsms/countries
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/getsms/countries");
        if (!res.ok) throw new Error("Failed to fetch countries data");
        const data = await res.json();
        setPricesData(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Flatten nested object into an array of PriceItem
  useEffect(() => {
    if (pricesData) {
      const flat: PriceItem[] = [];
      Object.keys(pricesData).forEach((country) => {
        Object.keys(pricesData[country]).forEach((category) => {
          Object.keys(pricesData[country][category]).forEach((product) => {
            const entry = pricesData[country][category][product];
            flat.push({
              country,
              category,
              product,
              cost: entry.cost ?? 0,
              count: entry.count ?? 0,
              rate: entry.rate ?? 0,
            });
          });
        });
      });
      setFlattenedData(flat);
    }
  }, [pricesData]);

  // Fetch exchange rates (base USD)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        if (!res.ok) throw new Error("Failed to fetch exchange rates");
        const data = await res.json();
        if (data.rates && data.rates["NGN"]) {
          setNgnRate(data.rates["NGN"]);
        }
      } catch (err) {
        console.error("Exchange rate error:", err);
      }
    };
    fetchExchangeRate();
  }, []);

  // Convert cost: if cost is missing, default to 0 so .toFixed() works
  const convertCostToUSD = (cost: number): string => {
    const validCost = typeof cost === "number" ? cost : 0;
    if (ngnRate) {
      const usd = validCost / ngnRate;
      return usd.toFixed(2) + " USD";
    }
    return validCost.toFixed(2) + " NGN";
  };

  // Filter data based on tab and search fields
  let filteredData: PriceItem[] = [];
  if (activeTab === "country") {
    filteredData = flattenedData.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        item.country.toLowerCase().includes(term) ||
        item.product.toLowerCase().includes(term)
      );
    });
  } else {
    filteredData = flattenedData.filter((item) => {
      const matchCountry = selectedCountry
        ? item.country.toLowerCase() === selectedCountry.toLowerCase()
        : true;
      const matchService = serviceSearch
        ? item.product.toLowerCase().includes(serviceSearch.toLowerCase())
        : true;
      return matchCountry && matchService;
    });
  }

  // Handlers
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setVisibleCount(50);
  };

  const handleServiceSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServiceSearch(e.target.value);
    setVisibleCount(50);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // Render country flag icon using the ISO mapping and flagcdn.com
  const renderCountryIcon = (country: string) => {
    return (
      <img
        src={getFlagUrl(country)}
        alt={country}
        className="w-5 h-5 inline-block mr-2 rounded"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://dummyimage.com/20x20/eeeeee/aaaaaa.png";
        }}
      />
    );
  };

  // Render service icon using Clearbit's logo API based on service name.
  // Extend mapping as required.
  const renderServiceIcon = (service: string) => {
    const lower = service.toLowerCase();
    if (lower.includes("facebook")) {
      return (
        <img
          src="https://logo.clearbit.com/facebook.com"
          alt="facebook"
          className="w-5 h-5 inline-block mr-2 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      );
    }
    if (lower.includes("twitter")) {
      return (
        <img
          src="https://logo.clearbit.com/twitter.com"
          alt="twitter"
          className="w-5 h-5 inline-block mr-2 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      );
    }
    // You can add additional service mappings here.
    return <FaGlobe className="inline-block mr-2 text-gray-500" />;
  };

  if (loading) return <div className="p-4 text-center">Loading prices...</div>;
  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Customer Prices</h1>

      {/* Tabs styled like WhatsApp */}
      <div className="flex mb-6">
        <button
          onClick={() => setActiveTab("country")}
          className={`flex-1 py-3 text-center font-semibold border-b-4 ${
            activeTab === "country"
              ? "border-green-500 text-green-500"
              : "border-transparent text-gray-500"
          }`}
        >
          By Country
        </button>
        <button
          onClick={() => setActiveTab("service")}
          className={`flex-1 py-3 text-center font-semibold border-b-4 ${
            activeTab === "service"
              ? "border-green-500 text-green-500"
              : "border-transparent text-gray-500"
          }`}
        >
          By Service
        </button>
      </div>

      {/* Filters */}
      {activeTab === "country" ? (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by country or service..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 border rounded shadow-sm"
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setVisibleCount(50);
            }}
            className="p-2 border rounded shadow-sm"
          >
            <option value="">All Countries</option>
            {[
              ...new Set(
                flattenedData.map((item) => item.country.toLowerCase())
              ),
            ].map((country, idx) => (
              <option key={idx} value={country}>
                {country.toUpperCase()}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by service..."
            value={serviceSearch}
            onChange={handleServiceSearchChange}
            className="w-full p-2 border rounded shadow-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border shadow-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 border">Country</th>
              <th className="px-4 py-3 border">Service</th>
              <th className="px-4 py-3 border">Price</th>
              <th className="px-4 py-3 border">Stock</th>
              <th className="px-4 py-3 border">Count</th>
              <th className="px-4 py-3 border">Rate</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, visibleCount).map((item, idx) => (
              <tr key={idx} className="text-center border-b hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center justify-center">
                  {renderCountryIcon(item.country)}
                  {item.country.toUpperCase()}
                </td>
                <td className="px-4 py-3 flex items-center justify-center">
                  {renderServiceIcon(item.product)}
                  {item.product}
                </td>
                <td className="px-4 py-3">{convertCostToUSD(item.cost)}</td>
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
            onClick={handleShowMore}
            className="px-6 py-3 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            See More
          </button>
        </div>
      )}
    </div>
  );
};

export default PricesPage;
