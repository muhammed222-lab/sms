/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { MdOutlinePriceChange } from "react-icons/md";

interface Product {
  cost?: number;
  count?: number;
  rate?: number;
}

interface CountryData {
  [product: string]: Product;
}

interface StatisticData {
  [country: string]: CountryData;
}

const INITIAL_PRODUCTS_LIMIT = 5;
const INITIAL_COUNTRIES_LIMIT = 10;

// A small mapping from country name to ISO code (in lowercase)
// Extend this mapping as needed.
const countryIsoMap: Record<string, string> = {
  russia: "ru",
  argentina: "ar",
  algeria: "dz",
  australia: "au",
  austria: "at",
  antiguaandbarbuda: "ag",
  aruba: "aw",
  // ... add more mappings as needed
};

const getFlagUrl = (country: string) => {
  const iso = countryIsoMap[country.toLowerCase()] || country.toLowerCase();
  return `https://flagcdn.com/w40/${iso}.png`;
};

const Statistic = () => {
  const [data, setData] = useState<StatisticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  // How many products to show per country
  const [visibleProducts, setVisibleProducts] = useState<{
    [country: string]: number;
  }>({});
  // How many countries to show at once
  const [visibleCountryCount, setVisibleCountryCount] = useState<number>(
    INITIAL_COUNTRIES_LIMIT
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setVisibleCountryCount(INITIAL_COUNTRIES_LIMIT);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch statistic data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/statistic");
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result);
        const initialMap: { [country: string]: number } = {};
        Object.keys(result).forEach((country) => {
          initialMap[country] = INITIAL_PRODUCTS_LIMIT;
        });
        setVisibleProducts(initialMap);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch exchange rate from RUB to USD using open.er-api.com
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/RUB");
        const json = await res.json();
        if (json && json.rates && json.rates.USD) {
          setExchangeRate(json.rates.USD);
        }
      } catch (error) {
        console.error("Error fetching exchange rate", error);
      }
    };
    fetchExchangeRate();
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter countries based on search
  const filteredCountries = data
    ? Object.keys(data).filter((country) => {
        const lowerSearch = debouncedSearch.toLowerCase();
        if (!lowerSearch) return true;
        if (country.toLowerCase().includes(lowerSearch)) return true;
        return Object.keys(data[country]).some((product) =>
          product.toLowerCase().includes(lowerSearch)
        );
      })
    : [];

  const displayedCountries = filteredCountries.slice(0, visibleCountryCount);

  const handleLoadMore = (country: string) => {
    setVisibleProducts((prev) => ({
      ...prev,
      [country]: prev[country] + INITIAL_PRODUCTS_LIMIT,
    }));
  };

  const handleLoadMoreCountries = () => {
    setVisibleCountryCount((prev) => prev + INITIAL_COUNTRIES_LIMIT);
  };

  if (loading)
    return <div className="text-center py-8">Loading statistics...</div>;
  if (error)
    return <div className="text-center text-red-500 py-8">Error: {error}</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-lg w-full">
      {/* Header and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MdOutlinePriceChange className="text-blue-500" /> Price Statistics
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search countries or products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:w-72 py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {filteredCountries.length === 0 ? (
        <div className="text-center text-gray-600">No results found.</div>
      ) : (
        <>
          {/* Responsive grid: 1 column on mobile, 3 columns on medium+ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedCountries.map((country, countryIdx) => {
              const products = data ? Object.keys(data[country]) : [];
              const visibleCount =
                visibleProducts[country] || INITIAL_PRODUCTS_LIMIT;
              const productsToShow = products.slice(0, visibleCount);
              return (
                <div
                  key={countryIdx}
                  className="bg-white rounded-lg border p-4"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {/* Country Flag using flagcdn.com with simple ISO mapping */}
                    <img
                      src={getFlagUrl(country)}
                      alt={country}
                      className="w-6 h-6 rounded"
                      onError={(e: any) => (e.target.style.display = "none")}
                    />
                    <h3 className="text-xl font-semibold">
                      {country.toUpperCase()}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                            Product
                          </th>
                          <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                            Price ($)
                          </th>
                          <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                            Count
                          </th>
                          <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {productsToShow.map((product, idx) => {
                          const productData = data![country][product];
                          // Convert cost from RUB to USD
                          const cost =
                            typeof productData.cost === "number"
                              ? (productData.cost * exchangeRate).toFixed(2)
                              : "-";
                          const count =
                            typeof productData.count === "number"
                              ? productData.count
                              : "-";
                          const trendIcon =
                            typeof productData.count === "number" &&
                            productData.count > 0 ? (
                              <FiTrendingUp className="text-green-500 inline" />
                            ) : (
                              <FiTrendingDown className="text-red-500 inline" />
                            );
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-2 px-4 text-sm text-gray-800">
                                {product}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-800">
                                ${cost}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-800">
                                {count}
                              </td>
                              <td className="py-2 px-4 text-sm">{trendIcon}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {products.length > visibleCount && (
                    <div className="mt-2 text-right">
                      <button
                        onClick={() => handleLoadMore(country)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Read More...
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filteredCountries.length > visibleCountryCount && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMoreCountries}
                className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                See More Countries...
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Statistic;
