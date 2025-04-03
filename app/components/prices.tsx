/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiSearch, FiGlobe, FiDollarSign, FiFilter } from "react-icons/fi";
import { FaExchangeAlt } from "react-icons/fa";
import clsx from "clsx";
import debounce from "lodash.debounce";

interface PriceEntry {
  cost: number;
  count: number;
  rate?: number;
}

interface PriceItem {
  country: string;
  product: string;
  category: string;
  cost: number;
  count: number;
  rate?: number;
}

const CURRENCIES = {
  USD: { name: "US Dollar", symbol: "$" },
  EUR: { name: "Euro", symbol: "€" },
  GBP: { name: "British Pound", symbol: "£" },
  RUB: { name: "Russian Ruble", symbol: "₽" },
  INR: { name: "Indian Rupee", symbol: "₹" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  russia: "ru",
  usa: "us",
  china: "cn",
  india: "in",
  brazil: "br",
  // Add more country mappings as needed
};

const SERVICE_ICONS: Record<string, string> = {
  telegram: "https://telegram.org/img/t_logo.png",
  whatsapp: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
  facebook:
    "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
  google:
    "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
  twitter:
    "https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg",
  // Add more service icons as needed
};

const PricingComponent = () => {
  const [prices, setPrices] = useState<
    Record<string, Record<string, Record<string, PriceEntry>>>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"country" | "service">("country");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // Using a free currency API (replace with your preferred API)
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const data = await response.json();
        setExchangeRates(data.rates || { USD: 1 });
      } catch (err) {
        console.error("Failed to fetch exchange rates:", err);
      }
    };
    fetchExchangeRates();
  }, []);

  // Mock data fetch - replace with actual API call to 5sim
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        // This would be replaced with actual API call to 5sim's pricing endpoint
        // const response = await fetch('https://5sim.net/v1/guest/prices');
        // const data = await response.json();

        // Mock data for demonstration
        const mockData = {
          russia: {
            telegram: {
              beeline: { cost: 8, count: 100, rate: 99.99 },
              megafon: { cost: 7, count: 85, rate: 98.5 },
            },
            whatsapp: {
              mts: { cost: 5, count: 120, rate: 97.8 },
              tele2: { cost: 6, count: 90, rate: 96.5 },
            },
          },
          usa: {
            facebook: {
              tmobile: { cost: 12, count: 50, rate: 95.5 },
              verizon: { cost: 15, count: 40, rate: 94.2 },
            },
            google: {
              att: { cost: 10, count: 75, rate: 97.1 },
            },
          },
          india: {
            telegram: {
              airtel: { cost: 4, count: 200, rate: 99.2 },
              jio: { cost: 3.5, count: 180, rate: 98.7 },
            },
          },
        };

        setPrices(mockData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load pricing data");
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Flatten the prices data for easier filtering
  const flattenedPrices = useMemo(() => {
    const result: PriceItem[] = [];
    Object.entries(prices).forEach(([country, products]) => {
      Object.entries(products).forEach(([product, operators]) => {
        Object.entries(operators).forEach(([operator, details]) => {
          result.push({
            country,
            product,
            category: operator,
            ...details,
          });
        });
      });
    });
    return result;
  }, [prices]);

  // Get unique countries and services for filters
  const countries = useMemo(() => {
    return Array.from(
      new Set(flattenedPrices.map((item) => item.country))
    ).sort();
  }, [flattenedPrices]);

  const services = useMemo(() => {
    return Array.from(
      new Set(flattenedPrices.map((item) => item.product))
    ).sort();
  }, [flattenedPrices]);

  // Filter prices based on search and selections
  const filteredPrices = useMemo(() => {
    return flattenedPrices.filter((item) => {
      // Search term filter
      const matchesSearch =
        searchTerm === "" ||
        item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Country filter
      const matchesCountry =
        selectedCountry === "" ||
        item.country.toLowerCase() === selectedCountry.toLowerCase();

      // Service filter
      const matchesService =
        selectedService === "" ||
        item.product.toLowerCase() === selectedService.toLowerCase();

      return matchesSearch && matchesCountry && matchesService;
    });
  }, [flattenedPrices, searchTerm, selectedCountry, selectedService]);

  // Calculate price with 50% markup and currency conversion
  const calculatePrice = useCallback(
    (cost: number) => {
      const costWithMarkup = cost * 1.5; // 50% markup
      const convertedPrice =
        costWithMarkup *
        (1 / (exchangeRates["USD"] || 1)) *
        (exchangeRates[currency] || 1);
      return convertedPrice;
    },
    [currency, exchangeRates]
  );

  // Format price with currency symbol
  const formatPrice = useCallback(
    (price: number) => {
      return `${CURRENCIES[currency].symbol}${price.toFixed(2)}`;
    },
    [currency]
  );

  // Debounced search
  const handleSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  // Get country flag URL
  const getCountryFlag = (country: string) => {
    const countryKey = country.toLowerCase();
    const countryCode = COUNTRY_FLAGS[countryKey] || "globe";
    return `https://flagcdn.com/w20/${countryCode}.png`;
  };

  // Get service icon
  const getServiceIcon = (service: string) => {
    const serviceKey = service.toLowerCase();
    return SERVICE_ICONS[serviceKey] || "https://via.placeholder.com/20";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800">
            SMS Verification Pricing
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time pricing with 50% service fee included
          </p>
        </div>

        {/* Controls */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by country, service or operator..."
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Currency Selector */}
            <div className="flex items-center space-x-2">
              <FiDollarSign className="text-gray-500" />
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as keyof typeof CURRENCIES)
                }
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                {Object.entries(CURRENCIES).map(([code, { name }]) => (
                  <option key={code} value={code}>
                    {name} ({code})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Services</option>
                    {services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("country")}
              className={clsx(
                "whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm",
                activeTab === "country"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Group by Country
            </button>
            <button
              onClick={() => setActiveTab("service")}
              className={clsx(
                "whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm",
                activeTab === "service"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Group by Service
            </button>
          </nav>
        </div>

        {/* Pricing Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {activeTab === "country" ? "Country" : "Service"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {activeTab === "country" ? "Service" : "Country"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Operator
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stock
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.length > 0 ? (
                filteredPrices.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {activeTab === "country" ? (
                          <>
                            <img
                              src={getCountryFlag(item.country)}
                              alt={item.country}
                              className="w-5 h-5 mr-2 rounded-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://flagcdn.com/w20/globe.png";
                              }}
                            />
                            <span className="capitalize">{item.country}</span>
                          </>
                        ) : (
                          <>
                            <img
                              src={getServiceIcon(item.product)}
                              alt={item.product}
                              className="w-5 h-5 mr-2 rounded-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/20";
                              }}
                            />
                            <span className="capitalize">{item.product}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeTab === "country" ? (
                        <span className="capitalize">{item.product}</span>
                      ) : (
                        <div className="flex items-center">
                          <img
                            src={getCountryFlag(item.country)}
                            alt={item.country}
                            className="w-5 h-5 mr-2 rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://flagcdn.com/w20/globe.png";
                            }}
                          />
                          <span className="capitalize">{item.country}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      {formatPrice(calculatePrice(item.cost))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {item.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {item.rate ? `${item.rate}%` : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No results found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">{filteredPrices.length}</span>{" "}
              results
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FaExchangeAlt className="mr-1" />
              <span>
                Exchange rate: 1 USD ={" "}
                {formatPrice(
                  (1 / (exchangeRates["USD"] || 1)) *
                    (exchangeRates[currency] || 1)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingComponent;
