"use client";
import React from "react";
import { useRouter } from "next/navigation";

const SuccessPage: React.FC = () => {
  const router = useRouter();

  const handleReturnToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-lg mb-6">
          Your payment has been processed successfully.
        </p>
        <button
          onClick={handleReturnToDashboard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Dashboard.
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
