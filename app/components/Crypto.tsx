import React, { useState, useEffect } from "react";
import ReactSelect from "react-select";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

const BitcoinPayment: React.FC = () => {
  const [amount, setAmount] = useState<number | null>(null);
  interface CurrencyOption {
    value: string;
    label: string;
  }

  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyOption | null>(null);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [btcRate, setBtcRate] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchBtcRate = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const data = await response.json();
      setBtcRate(data.bitcoin.usd);
    } catch (error) {
      console.error("Error fetching BTC rate:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();
      const currenciesList = Object.keys(data.rates).map((currency) => ({
        value: currency,
        label: currency,
      }));
      setCurrencies(currenciesList);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  useEffect(() => {
    fetchBtcRate();
    fetchCurrencies();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value < 5) {
      setError("Minimum amount is 5 USD upward or equivalent.");
      setAmount(null);
    } else {
      setError(null);
      setAmount(value);
      if (selectedCurrency) {
        convertAmount(value, selectedCurrency.value);
      }
    }
  };

  const handleCurrencyChange = (selectedOption: CurrencyOption | null) => {
    setSelectedCurrency(selectedOption);
    if (amount && selectedOption) {
      convertAmount(amount, selectedOption.value);
    }
  };

  const convertAmount = async (amount: number, currency: string) => {
    if (currency === "USD") {
      setConvertedAmount(amount);
      return;
    }

    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      const data = await response.json();
      const exchangeRate = data.rates[currency];
      const converted = amount * exchangeRate;
      setConvertedAmount(converted);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setConvertedAmount(null);
    }
  };

  const handleContinue = async () => {
    if (!amount || !selectedCurrency) return;

    let exchangeRate = 1;
    if (selectedCurrency.value !== "USD") {
      try {
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${selectedCurrency.value}`
        );
        const data = await response.json();
        exchangeRate = data.rates.USD;
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        alert("Error fetching exchange rate.");
        return;
      }
    }

    const amountInUSD = amount / exchangeRate;
    if (amountInUSD < 5) {
      alert("Amount must be at least 5 USD after conversion.");
      return;
    }

    try {
      const response = await fetch("/api/proxy-btc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInUSD.toFixed(2), // Ensure amount is a string with two decimal places
          currency: selectedCurrency.value, // Set currency to selected currency
        }),
      });

      const data = await response.json();
      if (data.success && data.data.result.url) {
        // Save transaction details to Firebase
        const transactionData = {
          address: data.data.result.address || "",
          amount: data.data.result.amount,
          created_at: data.data.result.created_at,
          currency: data.data.result.currency,
          discount: data.data.result.discount,
          expired_at: data.data.result.expired_at,
          from: data.data.result.from || "",
          is_final: data.data.result.is_final.toString(),
          order_id: data.data.result.order_id,
          payer_currency: data.data.result.payer_currency || "",
          payer_email: user?.email || "",
          payment_status: data.data.result.payment_status,
          txid: data.data.result.txid || "",
          updated_at: data.data.result.updated_at,
          uuid: data.data.result.uuid,
        };

        await addDoc(collection(db, "crypto_payment_history"), transactionData);

        // Redirect to payment URL
        window.location.href = data.data.result.url;
      } else {
        alert("Error processing payment.");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Error processing payment.");
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Pay with Bitcoin</h2>
      <p>
        Current BTC Rate:{" "}
        {loading ? "Fetching..." : `$${btcRate.toLocaleString()} per BTC`}
      </p>
      <button
        onClick={fetchBtcRate}
        className="p-2 bg-blue-500 text-white rounded mt-2"
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh BTC Rate"}
      </button>

      <label className="block mt-4">Enter Amount:</label>
      <input
        type="number"
        placeholder="e.g., 1.00"
        onChange={handleAmountChange}
        className="border rounded p-2 w-full mb-4"
      />

      {error && <p className="text-red-500">{error}</p>}

      <label className="block mt-4">Select Currency:</label>
      <ReactSelect
        options={currencies}
        onChange={handleCurrencyChange}
        className="mb-4"
      />

      {convertedAmount !== null && (
        <p>
          Converted Amount: {convertedAmount.toFixed(2)}{" "}
          {selectedCurrency?.label}
        </p>
      )}

      <button
        onClick={handleContinue}
        className="p-2 bg-green-500 text-white rounded mt-4"
      >
        Continue
      </button>
    </div>
  );
};

export default BitcoinPayment;
