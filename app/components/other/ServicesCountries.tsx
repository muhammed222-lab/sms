/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/ServicesCountries.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Service {
  name: string;
  slug: string;
  popularity: number;
}

interface Country {
  name: string;
  iso: string;
  popularity: number;
}

const ServicesCountries = () => {
  // Initial popular services
  const initialServices: Service[] = [
    { name: "WhatsApp", slug: "whatsapp", popularity: 100 },
    { name: "Telegram", slug: "telegram", popularity: 95 },
    { name: "Google", slug: "google", popularity: 90 },
    { name: "Facebook", slug: "facebook", popularity: 85 },
    { name: "TikTok", slug: "tiktok", popularity: 80 },
    { name: "Instagram", slug: "instagram", popularity: 75 },
    { name: "Twitter", slug: "twitter", popularity: 70 },
    { name: "Apple", slug: "apple", popularity: 65 },
    { name: "Discord", slug: "discord", popularity: 60 },
    { name: "Tinder", slug: "tinder", popularity: 55 },
    { name: "Amazon", slug: "amazon", popularity: 50 },
    { name: "LinkedIn", slug: "linkedin", popularity: 45 },
    { name: "Snapchat", slug: "snapchat", popularity: 40 },
    { name: "Pinterest", slug: "pinterest", popularity: 35 },
    { name: "Reddit", slug: "reddit", popularity: 30 },
    { name: "Spotify", slug: "spotify", popularity: 25 },
    { name: "Netflix", slug: "netflix", popularity: 20 },
    { name: "Microsoft", slug: "microsoft", popularity: 95 },
    { name: "Adobe", slug: "adobe", popularity: 85 },
    { name: "PayPal", slug: "paypal", popularity: 75 },
    { name: "eBay", slug: "ebay", popularity: 65 },
    { name: "Uber", slug: "uber", popularity: 55 },
    { name: "Airbnb", slug: "airbnb", popularity: 45 },
    { name: "GitHub", slug: "github", popularity: 35 },
    { name: "YouTube", slug: "youtube", popularity: 100 },
    { name: "Viber", slug: "viber", popularity: 90 },
    { name: "WeChat", slug: "wechat", popularity: 85 },
    { name: "Line", slug: "line", popularity: 80 },
    { name: "Signal", slug: "signal", popularity: 75 },
    { name: "Baidu", slug: "baidu", popularity: 70 },
    { name: "Yahoo", slug: "yahoo", popularity: 65 },
    { name: "Alibaba", slug: "alibaba", popularity: 60 },
    { name: "Tencent", slug: "tencent", popularity: 55 },
    { name: "Samsung", slug: "samsung", popularity: 50 },
    { name: "Huawei", slug: "huawei", popularity: 45 },
    { name: "Xiaomi", slug: "xiaomi", popularity: 40 },
    { name: "Oracle", slug: "oracle", popularity: 35 },
    { name: "IBM", slug: "ibm", popularity: 30 },
    { name: "Dell", slug: "dell", popularity: 25 },
    { name: "HP", slug: "hp", popularity: 20 },
    { name: "Intel", slug: "intel", popularity: 15 },
    { name: "AMD", slug: "amd", popularity: 10 },
  ];

  const [services, setServices] = useState<Service[]>(initialServices);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"services" | "countries">(
    "services"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();

        const formattedCountries = data
          .map((country: any) => ({
            name: country.name.common,
            iso: country.cca2.toLowerCase(),
            popularity: Math.floor(Math.random() * 100), // Random popularity for demo
          }))
          .sort((a: Country, b: Country) => b.popularity - a.popularity);

        setCountries(formattedCountries);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Fallback to some popular countries if API fails
        setCountries([
          { name: "United States", iso: "us", popularity: 100 },
          { name: "United Kingdom", iso: "gb", popularity: 95 },
          { name: "Canada", iso: "ca", popularity: 90 },
          { name: "Germany", iso: "de", popularity: 85 },
          { name: "France", iso: "fr", popularity: 80 },
          { name: "Japan", iso: "jp", popularity: 75 },
          { name: "India", iso: "in", popularity: 70 },
          { name: "Brazil", iso: "br", popularity: 65 },
          { name: "Nigeria", iso: "ng", popularity: 60 },
          { name: "South Africa", iso: "za", popularity: 55 },
          { name: "Australia", iso: "au", popularity: 50 },
          { name: "Singapore", iso: "sg", popularity: 45 },
        ]);
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const filteredServices = services
    .filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.popularity - a.popularity);

  const filteredCountries = countries
    .filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.popularity - a.popularity);

  const displayedServices = showAllServices
    ? filteredServices
    : filteredServices.slice(0, 12);

  const displayedCountries = showAllCountries
    ? filteredCountries
    : filteredCountries.slice(0, 12);

  return (
    <section className="py-16 ">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Global SMS Verification Coverage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access temporary numbers from around the world for all major
            services
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setActiveTab("services")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeTab === "services"
                    ? "bg-white border text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Popular Services
              </button>
              <button
                onClick={() => setActiveTab("countries")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeTab === "countries"
                    ? "bg-white border text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Available Countries
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "services" ? "services" : "countries"
                }...`}
                className="w-full px-5 py-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute right-4 top-3.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              {activeTab === "services" ? (
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">
                    Supported Services (5,000 +)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {displayedServices.map((service) => (
                      <div
                        key={`${service.slug}-${service.popularity}`} // Unique key
                        className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                      >
                        <div className="relative w-16 h-16 mb-3">
                          <Image
                            src={`https://logo.clearbit.com/${service.slug}.com`}
                            alt={service.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            unoptimized
                          />
                        </div>
                        <span className="font-medium text-gray-700 text-center">
                          {service.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  {filteredServices.length > 12 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setShowAllServices(!showAllServices)}
                        className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {showAllServices ? "Show Less" : `Show More`}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">
                    Available Countries ({filteredCountries.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {displayedCountries.map((country) => (
                      <div
                        key={`${country.iso}-${country.popularity}`} // Unique key
                        className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                      >
                        <div className="relative w-8 h-6 mr-3 flex-shrink-0">
                          <Image
                            src={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`}
                            alt={country.name}
                            fill
                            className="object-cover rounded-sm"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          />
                        </div>
                        <span className="font-medium text-gray-700">
                          {country.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  {filteredCountries.length > 12 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setShowAllCountries(!showAllCountries)}
                        className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {showAllCountries
                          ? "Show Less"
                          : `Show All (${filteredCountries.length})`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Need a service or country not listed here?
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
              Request New Verification Service
            </button>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default ServicesCountries;
