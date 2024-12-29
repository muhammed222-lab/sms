// app/deposit/page.tsx
'use client'
import React from "react";
import DepositForm from "../components/DepositForm";

const DepositPage = () => {
  return (
    <div>
      <h1>Deposit Page</h1>
      <DepositForm />
    </div>
  );
};

export default DepositPage;
