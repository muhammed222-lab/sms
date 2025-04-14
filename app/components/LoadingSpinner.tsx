// components/LoadingSpinner.tsx
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-lg font-medium">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
