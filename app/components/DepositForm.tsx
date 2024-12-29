"use client";
import React, { useState } from "react";

const DepositForm = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<number | string>(""); // Amount can be a number or string
  const [message, setMessage] = useState("");

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount: Number(amount) }), // Ensure amount is a number
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Deposit successful! New balance: ${data.user.balance}`);
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while processing the deposit.");
    }
  };

  return (
    <div>
      <h2>Deposit Funds</h2>
      <form onSubmit={handleDeposit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit">Deposit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default DepositForm;
