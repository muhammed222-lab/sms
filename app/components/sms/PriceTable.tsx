/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { getServiceLogoUrl } from "./utils";
import { FaSave } from "react-icons/fa";

interface PriceTableProps {
  selectedService: any;
  selectedCountry: any;
  price: string;
  stock: number | string;
  onSave: () => void;
}

const PriceTable: React.FC<PriceTableProps> = ({
  selectedService,
  selectedCountry,
  price,
  stock,
  onSave,
}) => (
  <div className="mt-4 overflow-x-auto">
    <table className="min-w-full border table-auto">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2">Service</th>
          <th className="border px-4 py-2">Country</th>
          <th className="border px-4 py-2">Price (USD)</th>
          <th className="border px-4 py-2">Stock</th>
          <th className="border px-4 py-2">Save</th>
        </tr>
      </thead>
      <tbody>
        <tr className="text-center">
          <td className="border px-4 py-2">
            <div className="inline-flex items-center gap-2">
              <img
                src={getServiceLogoUrl(selectedService.label.toLowerCase())}
                alt="logo"
                className="h-5 w-5"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = "/default-logo.png";
                }}
              />
              {selectedService.label}
            </div>
          </td>
          <td className="border px-4 py-2">
            <div className="inline-flex items-center gap-2">
              <img
                src={selectedCountry?.flagUrl}
                alt={selectedCountry?.label}
                className="h-5 w-5"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = "/default-flag.png";
                }}
              />
              {selectedCountry?.label}
            </div>
          </td>
          <td className="border px-4 py-2">{price}</td>
          <td className="border px-4 py-2">{stock || 0}</td>
          <td className="border px-4 py-2 text-center">
            <button
              onClick={onSave}
              className="flex items-center justify-center gap-1 text-green-500 hover:text-green-700"
            >
              <FaSave />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default PriceTable;
