// app/deposit/page.tsx
"use client";
import React from "react";
import DashboardBalance from "../components/DashboardBalance";
import Header from "../components/header";

const DepositPage = () => {
  return (
    <div>
      <Header />
      <div></div>
      <h1 className="text-4xl font-bold text-center mt-10">Deposit Funds</h1>
      <p className="text-lg text-center mt-4">
        Add funds to your account for seamless transactions.
      </p>
      <div className="flex justify-center mt-8"></div>
      <DashboardBalance />
    </div>
  );
};

export default DepositPage;
