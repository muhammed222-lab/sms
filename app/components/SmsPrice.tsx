import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

// Define the type for services, countries, and prices
interface Country {
  id: string;
  name: string;
  code: string;
  price: string; // Price in USD initially
  count: number;
}

interface Service {
  id: string;
  title: string;
  code: string;
}

// Define an exchange rates map instead of using any
type ExchangeRates = Record<string, number>;

// Move countriesData outside the component so that it is stable.
const countriesData: Country[] = [
  { id: "1", name: "Kazakhstan", code: "KZ", price: "$2.18", count: 7433 },
  { id: "2", name: "China", code: "CN", price: "$4.28", count: 100 },
  { id: "3", name: "USA", code: "US", price: "$0.31", count: 6022 },
  { id: "4", name: "Malaysia", code: "MY", price: "$0.74", count: 145084 },
  { id: "5", name: "Indonesia", code: "ID", price: "$0.31", count: 15072 },
  { id: "6", name: "Philippines", code: "PH", price: "$0.21", count: 20047 },
  { id: "7", name: "Myanmar", code: "MM", price: "$0.25", count: 200 },
  { id: "8", name: "Vietnam", code: "VN", price: "$0.49", count: 539 },
  { id: "9", name: "Romania", code: "RO", price: "$0.71", count: 1002 },
  { id: "10", name: "Poland", code: "PL", price: "$1.65", count: 1524 },
  { id: "11", name: "Canada", code: "CA", price: "$0.27", count: 7324 },
  { id: "12", name: "India", code: "IN", price: "$0.65", count: 6231 },
  { id: "13", name: "Zambia", code: "ZM", price: "$0.16", count: 486 },
  { id: "14", name: "Pakistan", code: "PK", price: "$0.19", count: 210 },
  { id: "15", name: "Bangladesh", code: "BD", price: "$0.25", count: 289 },
  { id: "16", name: "Mexico", code: "MX", price: "$0.65", count: 9108 },
  { id: "17", name: "Cambodia", code: "KH", price: "$0.79", count: 200 },
  { id: "18", name: "Nicaragua", code: "NI", price: "$0.24", count: 264 },
  { id: "19", name: "Kenya", code: "KE", price: "$0.40", count: 3388 },
  { id: "20", name: "Kyrgyzstan", code: "KG", price: "$0.74", count: 1001 },
  { id: "21", name: "Israel", code: "IL", price: "$0.74", count: 48993 },
  { id: "22", name: "Hong Kong", code: "HK", price: "$0.92", count: 20067 },
  {
    id: "23",
    name: "United Kingdom/England",
    code: "GB",
    price: "$1.10",
    count: 114998,
  },
  { id: "24", name: "Madagascar", code: "MG", price: "$0.60", count: 266 },
  { id: "25", name: "Congo", code: "CG", price: "$0.25", count: 782 },
  { id: "26", name: "Nigeria", code: "NG", price: "$0.86", count: 2031 },
  { id: "27", name: "Macao", code: "MO", price: "$4.03", count: 200 },
  { id: "28", name: "Egypt", code: "EG", price: "$0.21", count: 400 },
  { id: "29", name: "Ireland", code: "IE", price: "$4.89", count: 1200 },
  { id: "30", name: "Laos", code: "LA", price: "$0.54", count: 144 },
  { id: "31", name: "Haiti", code: "HT", price: "$0.16", count: 990 },
  { id: "32", name: "Côte d'Ivoire", code: "CI", price: "$0.75", count: 112 },
  { id: "33", name: "Gambia", code: "GM", price: "$0.26", count: 154 },
  { id: "34", name: "Serbia", code: "RS", price: "$0.33", count: 1000 },
  { id: "35", name: "Yemen", code: "YE", price: "$0.25", count: 204 },
  {
    id: "36",
    name: "South Africa",
    code: "ZA",
    price: "$0.27",
    count: 18582,
  },
  { id: "37", name: "Colombia", code: "CO", price: "$0.58", count: 2446 },
  { id: "38", name: "Estonia", code: "EE", price: "$1.35", count: 1307 },
  { id: "39", name: "Azerbaijan", code: "AZ", price: "$0.49", count: 206975 },
  { id: "40", name: "Morocco", code: "MA", price: "$0.60", count: 1696 },
  { id: "41", name: "Ghana", code: "GH", price: "$0.27", count: 1655 },
  { id: "42", name: "Argentina", code: "AR", price: "$0.59", count: 9296 },
  { id: "43", name: "Uzbekistan", code: "UZ", price: "$1.41", count: 384 },
  { id: "44", name: "Cameroon", code: "CM", price: "$0.82", count: 549 },
  { id: "45", name: "Chad", code: "TD", price: "$0.25", count: 66 },
  { id: "46", name: "Germany", code: "DE", price: "$2.87", count: 1497 },
  { id: "47", name: "Lithuania", code: "LT", price: "$1.84", count: 1100 },
  { id: "48", name: "Croatia", code: "HR", price: "$1.04", count: 1000 },
  { id: "49", name: "Sweden", code: "SE", price: "$2.45", count: 1433 },
  { id: "50", name: "Iraq", code: "IQ", price: "$0.16", count: 542 },
  { id: "51", name: "Netherlands", code: "NL", price: "$2.14", count: 1541 },
  { id: "52", name: "Latvia", code: "LV", price: "$1.53", count: 1043 },
  { id: "53", name: "Austria", code: "AT", price: "$2.32", count: 1004 },
  { id: "54", name: "Belarus", code: "BY", price: "$0.39", count: 44 },
  { id: "55", name: "Thailand", code: "TH", price: "$0.80", count: 2906 },
  { id: "56", name: "Saudi Arabia", code: "SA", price: "$0.27", count: 376 },
  { id: "57", name: "Spain", code: "ES", price: "$3.36", count: 2383 },
  { id: "58", name: "Algeria", code: "DZ", price: "$0.65", count: 3050 },
  { id: "59", name: "Slovenia", code: "SI", price: "$0.86", count: 2186 },
  { id: "60", name: "Senegal", code: "SN", price: "$0.43", count: 1806 },
  { id: "61", name: "Turkey", code: "TR", price: "$4.28", count: 8751 },
  { id: "62", name: "Czechia", code: "CZ", price: "$1.71", count: 1295 },
  { id: "63", name: "Sri Lanka", code: "LK", price: "$0.79", count: 200 },
  { id: "64", name: "Peru", code: "PE", price: "$0.43", count: 110 },
  { id: "65", name: "Guinea", code: "GN", price: "$0.26", count: 154 },
  { id: "66", name: "Mali", code: "ML", price: "$0.16", count: 500 },
  { id: "67", name: "Venezuela", code: "VE", price: "$0.65", count: 4826 },
  { id: "68", name: "Ethiopia", code: "ET", price: "$0.16", count: 352 },
  { id: "69", name: "Brazil", code: "BR", price: "$4.28", count: 3556 },
  { id: "70", name: "Afghanistan", code: "AF", price: "$0.26", count: 276 },
  { id: "71", name: "Uganda", code: "UG", price: "$0.16", count: 870 },
  { id: "72", name: "Angola", code: "AO", price: "$0.37", count: 5480 },
  { id: "73", name: "Cyprus", code: "CY", price: "$3.36", count: 1000 },
  { id: "74", name: "France", code: "FR", price: "$1.47", count: 3274 },
  {
    id: "75",
    name: "Papua New Guinea",
    code: "PG",
    price: "$0.26",
    count: 88,
  },
  { id: "76", name: "Mozambique", code: "MZ", price: "$0.31", count: 562 },
  { id: "77", name: "Nepal", code: "NP", price: "$0.11", count: 264 },
  { id: "78", name: "Bulgaria", code: "BG", price: "$1.53", count: 1122 },
  { id: "79", name: "Hungary", code: "HU", price: "$0.24", count: 1000 },
  { id: "80", name: "Moldova", code: "MD", price: "$0.40", count: 11 },
  { id: "81", name: "Italy", code: "IT", price: "$5.99", count: 1210 },
  { id: "82", name: "Paraguay", code: "PY", price: "$0.13", count: 22 },
  { id: "83", name: "Tunisia", code: "TN", price: "$0.22", count: 1034 },
  { id: "84", name: "Somalia", code: "SO", price: "$0.36", count: 222 },
  { id: "85", name: "Timor-Leste", code: "TL", price: "$0.27", count: 59882 },
  { id: "86", name: "Guatemala", code: "GT", price: "$0.73", count: 93425 },
  {
    id: "87",
    name: "United Arab Emirates",
    code: "AE",
    price: "$0.24",
    count: 22,
  },
  { id: "88", name: "Zimbabwe", code: "ZW", price: "$0.27", count: 198 },
  { id: "89", name: "Puerto Rico", code: "PR", price: "$0.20", count: 1166 },
  { id: "90", name: "Sudan", code: "SD", price: "$0.35", count: 207 },
  { id: "91", name: "Togo", code: "TG", price: "$0.46", count: 292 },
  { id: "92", name: "DR Congo", code: "CD", price: "$0.31", count: 1058 },
  { id: "93", name: "Armenia", code: "AM", price: "$4.28", count: 330 },
  { id: "94", name: "Australia", code: "AU", price: "$4.03", count: 151 },
  { id: "95", name: "Bahrain", code: "BH", price: "$0.18", count: 22 },
  { id: "96", name: "Belize", code: "BZ", price: "$4.28", count: 66 },
  { id: "97", name: "Benin", code: "BJ", price: "$0.18", count: 279 },
  {
    id: "98",
    name: "Bosnia and Herzegovina",
    code: "BA",
    price: "$5.50",
    count: 44,
  },
  { id: "99", name: "Burkina Faso", code: "BF", price: "$0.16", count: 330 },
  { id: "100", name: "Burundi", code: "BI", price: "$0.31", count: 101 },
  {
    id: "101",
    name: "Central African Republic",
    code: "CF",
    price: "$0.26",
    count: 266,
  },
  { id: "102", name: "Chile", code: "CL", price: "$0.62", count: 936 },
  { id: "103", name: "Comoros", code: "KM", price: "$0.18", count: 22 },
  {
    id: "104",
    name: "Dominican Republic",
    code: "DO",
    price: "$0.31",
    count: 16930,
  },
  { id: "105", name: "Ecuador", code: "EC", price: "$0.18", count: 44 },
  { id: "106", name: "El Salvador", code: "SV", price: "$0.18", count: 228 },
  {
    id: "107",
    name: "Equatorial Guinea",
    code: "GQ",
    price: "$0.16",
    count: 66,
  },
  { id: "108", name: "Finland", code: "FI", price: "$1.35", count: 280 },
  { id: "109", name: "Georgia", code: "GE", price: "$1.35", count: 1264 },
  { id: "110", name: "Greece", code: "GR", price: "$1.04", count: 1025 },
  { id: "111", name: "Guyana", code: "GY", price: "$0.17", count: 66 },
  { id: "112", name: "Japan", code: "JP", price: "$3.67", count: 300 },
  { id: "113", name: "Jordan", code: "JO", price: "$0.18", count: 990 },
  { id: "114", name: "Lebanon", code: "LB", price: "$0.19", count: 508 },
  { id: "115", name: "Lesotho", code: "LS", price: "$0.26", count: 22 },
  { id: "116", name: "Liberia", code: "LR", price: "$0.17", count: 22 },
  { id: "117", name: "Malawi", code: "MW", price: "$0.18", count: 100 },
  { id: "118", name: "Maldives", code: "MV", price: "$2.93", count: 22 },
  { id: "119", name: "Mauritania", code: "MR", price: "$0.26", count: 396 },
  { id: "120", name: "Mauritius", code: "MU", price: "$0.26", count: 44 },
  { id: "121", name: "Namibia", code: "NA", price: "$0.26", count: 220 },
  { id: "122", name: "Niger", code: "NE", price: "$0.17", count: 44 },
  { id: "123", name: "Oman", code: "OM", price: "$0.18", count: 22 },
  { id: "124", name: "Portugal", code: "PT", price: "$2.08", count: 1598 },
  { id: "125", name: "Singapore", code: "SG", price: "$6.11", count: 100 },
  { id: "126", name: "Tajikistan", code: "TJ", price: "$0.46", count: 44 },
  {
    id: "127",
    name: "Trinidad and Tobago",
    code: "TT",
    price: "$0.17",
    count: 286,
  },
  { id: "128", name: "Uruguay", code: "UY", price: "$0.26", count: 506 },
  {
    id: "129",
    name: "Korea, Republic of",
    code: "KR",
    price: "$15.87",
    count: 22,
  },
  { id: "130", name: "Libya", code: "LY", price: "$0.37", count: 4086 },
  { id: "131", name: "Palestine", code: "PS", price: "$0.37", count: 100 },
  // Add more countries here
];

const SmsPrice: React.FC = () => {
  // If these states are not used later, consider removing them.
  const [, setSelectedCountry] = useState<Country | null>(null); // Currently assigned but unused
  const [] = useState<Service | null>(null); // Currently assigned but unused
  const [, setServices] = useState<Service[]>([]); // Currently assigned but unused
  const [] = useState<number>(0); // Currently assigned but unused

  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Search term for countries
  const [loading, setLoading] = useState<boolean>(true);
  const [userCurrency, setUserCurrency] = useState<string>("USD");
  const [conversionRates, setConversionRates] = useState<ExchangeRates>({});
  const [, setUserLocation] = useState<string>("");

  const fetchServices = async () => {
    try {
      const response = await fetch("../../api/servicesList.json");
      const data = await response.json();
      setServices(Object.values(data)); // Convert services object to array
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    setCountries(countriesData);
    fetchServices();
    setLoading(false);

    fetch("https://ipinfo.io/json")
      .then((res) => res.json())
      .then((data) => {
        setUserLocation(data.country);
        fetchExchangeRates(data.country);
      })
      .catch((error) => console.error("Geolocation error:", error));
  }, [countriesData]); // Now countriesData is stable

  const fetchExchangeRates = async (userCountry: string) => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();
      setConversionRates(data.rates);
      setUserCurrency(userCountry);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  const convertPriceToLocalCurrency = (price: string) => {
    const priceInUSD = parseFloat(price.replace("$", ""));
    if (conversionRates[userCurrency]) {
      const convertedPrice = priceInUSD * conversionRates[userCurrency];
      return `${convertedPrice.toFixed(2)} ${userCurrency}`;
    }
    return price;
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">SMS Prices</h2>

      {/* Search input for countries */}
      <div className="mb-4 flex items-center border p-2 rounded-lg">
        <FaSearch className="mr-2" />
        <input
          type="text"
          placeholder="Search by country"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {/* Country List */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Country Prices</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-scroll overflow-x-hidden">
              {filteredCountries.map((country) => (
                <div
                  key={`${country.id}-${country.name}`}
                  className="p-4 rounded-lg text-center cursor-pointer flex flex-col items-center justify-between w-full h-auto bg-white border hover:shadow-lg transition-all"
                  onClick={() => setSelectedCountry(country)}
                >
                  {/* Consider using Next.js Image component for optimization */}
                  <img
                    src={`https://flagcdn.com/w320/${country.code.toLowerCase()}.png`}
                    alt={country.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="text-sm font-semibold text-gray-800">
                    {country.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {country.count} numbers
                  </p>
                  <p className="mt-2 text-lg font-semibold text-blue-600">
                    {convertPriceToLocalCurrency(country.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Service List */}

          {/* Buy SMS Button */}
        </>
      )}
    </div>
  );
};

export default SmsPrice;
