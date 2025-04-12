/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React from "react";
import AsyncSelect from "react-select/async";
import { getServiceLogoUrl } from "./utils";

interface ServiceSelectorProps {
  selectedCountry: any;
  selectedService: any;
  initialServices: any[];
  pageSize: number;
  onChange: (option: any) => void;
  onLoadMore: () => void;
  loading: boolean;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedCountry,
  selectedService,
  initialServices,
  pageSize,
  onChange,
  onLoadMore,
  loading,
}) => {
  const loadOptions = async (inputValue: string) => {
    if (!selectedCountry) return [];
    if (inputValue && inputValue.length >= 2) {
      return initialServices.filter((service) =>
        service.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    }
    return initialServices.slice(0, pageSize);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Select a service</label>
      {selectedCountry ? (
        <AsyncSelect
          inputId="service-select"
          isDisabled={!selectedCountry}
          noOptionsMessage={() =>
            !selectedCountry
              ? "Please select a country first"
              : "No options found"
          }
          cacheOptions
          defaultOptions={initialServices.slice(0, pageSize)}
          loadOptions={loadOptions}
          onChange={onChange}
          placeholder="Search by service..."
          isLoading={loading}
          onMenuScrollToBottom={onLoadMore}
          formatOptionLabel={(option: any) => (
            <div className="flex items-center gap-2">
              <img
                src={getServiceLogoUrl(option.label.toLowerCase())}
                alt=""
                className="w-5 h-5"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = "/default-logo.png";
                }}
              />
              {option.label}
            </div>
          )}
        />
      ) : (
        <p className="text-sm text-gray-500">Please select a country first.</p>
      )}
    </div>
  );
};

export default ServiceSelector;
