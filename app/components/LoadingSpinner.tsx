import React from "react";
import Image from "next/image";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-24 h-24">
        {/* Logo in the center - Optimized Image */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Image
            src="/spinner.png"
            alt="Loading"
            width={38}
            height={38}
            priority // Critical: preloads image
            loading="eager" // Load immediately
            quality={75} // Optimal quality/size balance
            className="object-contain"
          />
        </div>

        {/* Spinner around the logo (unchanged) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full border-4 border-transparent rounded-full relative">
            <div
              className="absolute top-0 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-spinner-dot"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="absolute top-1/4 right-0 w-4 h-4 bg-blue-500 rounded-full transform translate-x-1/2 -translate-y-1/2 animate-spinner-dot"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="absolute bottom-1/4 right-0 w-4 h-4 bg-blue-500 rounded-full transform translate-x-1/2 translate-y-1/2 animate-spinner-dot"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="absolute bottom-0 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 animate-spinner-dot"
              style={{ animationDelay: "0.3s" }}
            ></div>
            <div
              className="absolute bottom-1/4 left-0 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 animate-spinner-dot"
              style={{ animationDelay: "0.4s" }}
            ></div>
            <div
              className="absolute top-1/4 left-0 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-spinner-dot"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
        </div>
      </div>
      <span className="text-lg font-medium text-blue-500">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
