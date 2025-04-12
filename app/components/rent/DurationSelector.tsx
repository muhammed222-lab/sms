/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/rent/DurationSelector.tsx
import React from "react";

interface DurationSelectorProps {
  rentalDuration: string;
  setRentalDuration: (value: string) => void;
  selectedProduct: string;
  products: Record<string, any>;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  rentalDuration,
  setRentalDuration,
  selectedProduct,
  products,
}) => {
  const calculateFinalPrice = (basePrice: number, duration: string) => {
    switch (duration) {
      case "1 hour":
        return basePrice * 1.5;
      case "1 day":
        return basePrice * 2;
      case "1 week":
        return basePrice * 5;
      default:
        return basePrice;
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <label className="font-medium block mb-2">Rental Duration:</label>
      <div className="flex flex-wrap gap-4">
        {["1 hour", "1 day", "1 week"].map((duration) => (
          <div key={duration} className="flex items-center">
            <input
              type="radio"
              id={duration}
              name="duration"
              value={duration}
              checked={rentalDuration === duration}
              onChange={() => setRentalDuration(duration)}
              className="mr-2"
            />
            <label htmlFor={duration} className="flex items-center">
              {duration}
              {selectedProduct && (
                <span className="ml-2 text-blue-600 font-medium">
                  ($
                  {calculateFinalPrice(
                    products[selectedProduct]?.Price || 0,
                    duration
                  ).toFixed(2)}
                  )
                </span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
