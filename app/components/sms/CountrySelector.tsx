/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React from "react";
import Select from "react-select";

interface CountrySelectorProps {
  countries: any[];
  selectedCountry: any;
  onChange: (option: any) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  countries,
  selectedCountry,
  onChange,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">Select a country</label>
    <Select
      inputId="country-select"
      options={countries}
      value={selectedCountry}
      onChange={onChange}
      placeholder="Search by country..."
      formatOptionLabel={(option: any) => (
        <div className="flex items-center gap-2">
          <img
            src={option.flagUrl}
            alt=""
            className="w-5 h-5"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = "/default-flag.png";
            }}
          />
          {option.label}
        </div>
      )}
    />
  </div>
);

export default CountrySelector;
