"use client";

import React from "react";

const Rewards: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Rewards</h3>
      <p className="text-gray-600 mb-4">Check out your earned rewards below:</p>
      <ul className="list-disc pl-5">
        <li className="text-gray-700">Reward 1: $10 Credit</li>
        <li className="text-gray-700">Reward 2: $5 Credit</li>
        <li className="text-gray-700">
          Reward 3: Free Subscription for 1 Month
        </li>
      </ul>
    </div>
  );
};

export default Rewards;
