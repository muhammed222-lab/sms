import React, { useEffect, useState } from "react";
import RecentSmsOrders from "./RecentSmsOrders";

interface Country {
  name_en: string;
  id: string;
  country_code: string;
}

interface RentalData {
  country_id: string;
  count: string;
  cost: string;
}

const RentNumbers: React.FC = () => {
  const API_BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:4001/api"
      : "/api";

  const [countries, setCountries] = useState<Country[]>([]);
  const [searchCountry, setSearchCountry] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("hour");
  const [hours, setHours] = useState<number>(1);
  const [rentalData, setRentalData] = useState<RentalData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const countryMapping: { [key: string]: { name: string; flagCode: string } } =
    {
      "12": { name: "Estonia", flagCode: "ee" },
      "100": { name: "Czechia", flagCode: "cz" },
      "103": { name: "Sweden", flagCode: "se" },
      "107": { name: "Netherlands", flagCode: "nl" },
      "115": { name: "Portugal", flagCode: "pt" },
      "123": { name: "Laos", flagCode: "la" },
      "126": { name: "Thailand", flagCode: "th" },
      "128": { name: "Germany", flagCode: "de" },
      "132": { name: "Poland", flagCode: "pl" },
      "141": { name: "Lithuania", flagCode: "lt" },
      "152": { name: "Latvia", flagCode: "lv" },
      "263": { name: "South Africa", flagCode: "za" },
      "41": { name: "Nigeria", flagCode: "ng" },
      "24": { name: "United Kingdom", flagCode: "gb" },
      "14": { name: "Uganda", flagCode: "ug" },
    };

  useEffect(() => {
    const mappedCountries = Object.keys(countryMapping).map((id) => ({
      id,
      name_en: countryMapping[id].name,
      country_code: countryMapping[id].flagCode,
    }));
    setCountries(mappedCountries);
  }, [countryMapping]);

  useEffect(() => {
    if (!selectedCountry) return;

    const fetchRentalData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/rent-handler?action=get-limits&country_id=${selectedCountry}&type=${duration}&time=${hours}`
        );
        if (!response.ok) throw new Error("Failed to fetch rental data.");
        const data = await response.json();
        if (Array.isArray(data)) {
          setRentalData(data);
        } else {
          setRentalData([]);
          setMessage("No rental options available.");
        }
      } catch (error) {
        console.error("Error fetching rental data:", error);
        setRentalData([]);
        setMessage("Failed to load rental data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRentalData();
  }, [selectedCountry, duration, hours, API_BASE_URL]);

  const handleIncreaseHours = () => setHours((prev) => prev + 1);
  const handleDecreaseHours = () =>
    setHours((prev) => (prev > 1 ? prev - 1 : 1));

  const handleRentClick = async (countryId: string) => {
    setMessage("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/rent-handler?action=get-number&country_id=${countryId}&type=${duration}&time=${hours}`
      );
      const data = await response.json();
      if (data.error) {
        setMessage("Sorry, we will get back to you.");
      } else if (data.request_id) {
        setMessage(`Number rented successfully: ${data.number}`);
      } else {
        setMessage("Failed to rent a number. Please try again.");
      }
    } catch (error) {
      console.error("Error renting number:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col p-6 rounded-lg bg-gray-100 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Rent New Number</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-4">1. Select Your Country</h2>
          <input
            type="text"
            className="border px-4 py-2 mb-4 w-full rounded"
            placeholder="Search by country"
            value={searchCountry}
            onChange={(e) => setSearchCountry(e.target.value)}
          />
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {countries
              .filter((country) =>
                country.name_en
                  .toLowerCase()
                  .includes(searchCountry.toLowerCase())
              )
              .map((country) => (
                <div
                  key={country.id}
                  className={`p-2 rounded cursor-pointer flex items-center gap-2 ${
                    selectedCountry === country.id
                      ? "bg-blue-100"
                      : "bg-gray-50 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedCountry(country.id)}
                >
                  <img
                    src={`https://flagcdn.com/w40/${country.country_code}.png`}
                    alt={country.name_en}
                    className="w-6 h-4"
                  />
                  <span>{country.name_en}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-4">2. Set Rent Duration</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {["hour", "day", "week", "month"].map((type) => (
              <button
                key={type}
                className={`p-2 rounded border ${
                  duration === type
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-50 hover:bg-gray-200"
                }`}
                onClick={() => setDuration(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          {duration === "hour" && (
            <div className="flex items-center justify-center">
              <button
                className="px-4 py-2 bg-gray-200"
                onClick={handleDecreaseHours}
              >
                -
              </button>
              <span className="px-6 py-2">{hours}</span>
              <button
                className="px-4 py-2 bg-gray-200"
                onClick={handleIncreaseHours}
              >
                +
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-4">3. Rent a Number</h2>
          {loading ? (
            <p>Loading rental options...</p>
          ) : rentalData.length > 0 ? (
            <div className="space-y-2">
              {rentalData.map((option) => (
                <div
                  key={option.country_id}
                  className="p-2 rounded border bg-gray-50 flex justify-between items-center"
                >
                  <span>{`Numbers: ${option.count}, Cost: ${option.cost}`}</span>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => handleRentClick(option.country_id)}
                  >
                    Rent
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No rental options available.</p>
          )}
        </div>
      </div>

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      <RecentSmsOrders />
    </div>
  );
};

export default RentNumbers;
