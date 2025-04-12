/* eslint-disable @typescript-eslint/no-explicit-any */
// components/rent/ProductSelector.tsx
import React from "react";
import Select from "react-select";

interface ProductSelectorProps {
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  products: Record<string, any>;
  rentalDuration: string;
  disabled?: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProduct,
  setSelectedProduct,
  products,
  rentalDuration,
  disabled,
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

  const productOptions = Object.keys(products).map((product) => {
    const basePrice = products[product]?.Price || 0;
    const finalPrice = calculateFinalPrice(basePrice, rentalDuration);
    return {
      value: product,
      label: `${product} ($${finalPrice.toFixed(2)})`,
      data: products[product],
    };
  });

  return (
    <div>
      <label className="block font-medium mb-2">Service</label>
      <Select
        options={productOptions}
        value={
          productOptions.find((opt) => opt.value === selectedProduct) || null
        }
        onChange={(selectedOption) => {
          if (selectedOption) {
            setSelectedProduct(selectedOption.value);
          }
        }}
        className="react-select-container"
        classNamePrefix="react-select"
        isDisabled={disabled}
        placeholder={
          productOptions.length ? "Select service..." : "No services available"
        }
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
      />
    </div>
  );
};

export default ProductSelector;
