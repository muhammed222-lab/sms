import React, { useState, useEffect } from "react";

const PricesTable = ({ selectedCountry, token }) => {
  const [prices, setPrices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("RUB"); // Default currency is RUB
  const [loading, setLoading] = useState(false); // For loading state

  const resultsPerPage = 20; // Display 20 results per page

  // Fetch prices from the API
  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true); // Set loading to true when starting to fetch data
      try {
        const response = await fetch(
          `https://api.sms-man.com/control/get-prices?token=${token}&country_id=${selectedCountry.value}`
        );
        const data = await response.json();

        if (data.error) {
          console.error("Error fetching prices:", data.error);
          setPrices([]); // Set prices to empty if there's an error
        } else {
          const allPrices = [];
          for (let serviceId in data) {
            for (let priceId in data[serviceId]) {
              allPrices.push({
                serviceId,
                priceId,
                serviceName: `Service ${serviceId}`, // Adjust if needed based on actual data
                cost: data[serviceId][priceId].cost,
                count: data[serviceId][priceId].count,
              });
            }
          }
          setPrices(allPrices);
          setTotalPages(Math.ceil(allPrices.length / resultsPerPage)); // Calculate total pages
        }
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching is complete
      }
    };

    if (selectedCountry && token) {
      fetchPrices();
    }
  }, [selectedCountry, token]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Filter prices based on search query
  const filteredPrices = prices.filter((price) =>
    price.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate filtered prices
  const paginatedPrices = filteredPrices.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Handle next and previous page navigation
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Product Prices</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search services..."
          className="border px-4 py-2 rounded-lg w-full"
        />
      </div>

      {/* Loading State */}
      {loading && <p>Loading...</p>}

      {/* Table */}
      {paginatedPrices && paginatedPrices.length > 0 ? (
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Service</th>
              <th className="px-4 py-2 border">Price ({currency})</th>
              <th className="px-4 py-2 border">Available Numbers</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPrices.map((service) => (
              <tr key={`${service.serviceId}-${service.priceId}`}>
                <td className="px-4 py-2 border">{service.serviceName}</td>
                <td className="px-4 py-2 border">{service.cost}</td>
                <td className="px-4 py-2 border">{service.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No prices available for this country.</p> // Only show this if not loading
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <span className="text-lg self-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PricesTable;
