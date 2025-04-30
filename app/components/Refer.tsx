/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  FaCopy,
  FaCheck,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaWallet,
} from "react-icons/fa";
import { assignReferralCode } from "../utils/referralUtils";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiDollarSign, FiCalendar, FiCreditCard } from "react-icons/fi";
import debounce from "lodash.debounce";
import Select from "react-select";
import { MdAccountBalance } from "react-icons/md";
import emailjs from "@emailjs/browser";

interface Bank {
  id: number;
  code: string;
  name: string;
  logo?: string;
}

interface NIBSSBank {
  id: number;
  InstitutionCode: string;
  InstitutionName: string;
  Category: string;
  logo: string;
}

const Refer: React.FC = () => {
  const [referralLink, setReferralLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [invitedUsers, setInvitedUsers] = useState<any[]>([]);
  const [fetchingInvites, setFetchingInvites] = useState<boolean>(true);
  const [totalCommission, setTotalCommission] = useState<number>(0);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [bankSuggestions, setBankSuggestions] = useState<Bank[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState<string>("");
  const [accountName, setAccountName] = useState<string | null>(null);
  const [verifyingAccount, setVerifyingAccount] = useState<boolean>(false);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [allBanks, setAllBanks] = useState<Bank[]>([]);
  const [isSearchingBanks, setIsSearchingBanks] = useState(false);
  const [isUSAccount, setIsUSAccount] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletType, setWalletType] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankSearch, setBankSearch] = useState<string>("");
  const [nibssBanks, setNibssBanks] = useState<NIBSSBank[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1500); // Default exchange rate
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [rateLoading, setRateLoading] = useState<boolean>(true);
  const [rateError, setRateError] = useState<string | null>(null);

  // Load NIBSS banks
  useEffect(() => {
    const loadNibssBanks = async () => {
      try {
        const response = await fetch(
          "https://gist.githubusercontent.com/OlabodeAbesin/1bb27b3e1847d8efaabcd9a1eb950147/raw/9976389dac715b59f78930682083e5c54e47ec8b/NIbssistitutionlist"
        );
        const data = await response.json();
        setNibssBanks(data);
      } catch (error) {
        console.error("Error loading NIBSS banks:", error);
      }
    };
    loadNibssBanks();
  }, []);

  // Fetch current exchange rate from a real API
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setRateLoading(true);
      setRateError(null);
      try {
        // Using a free forex API (you might want to use a more reliable paid API in production)
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const data = await response.json();

        if (data.rates && data.rates.NGN) {
          setExchangeRate(data.rates.NGN);
        } else {
          throw new Error("NGN rate not available");
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        setRateError(
          "Failed to fetch current exchange rate. Using default rate."
        );
        // Fallback to a reasonable default if API fails
        setExchangeRate(1500);
      } finally {
        setRateLoading(false);
      }
    };

    fetchExchangeRate();

    // Refresh rate every hour
    const interval = setInterval(fetchExchangeRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Load all banks with logos from NIBSS data
  useEffect(() => {
    if (nibssBanks.length > 0) {
      const banks = nibssBanks.map((bank) => ({
        id: bank.id,
        code: bank.InstitutionCode,
        name: bank.InstitutionName,
        logo: bank.logo || undefined,
      }));
      setAllBanks(banks);
    }
  }, [nibssBanks]);

  // Filter banks based on search query
  useEffect(() => {
    if (bankSearch.length >= 2) {
      setIsSearchingBanks(true);
      const filtered = allBanks.filter((bank) =>
        bank.name.toLowerCase().includes(bankSearch.toLowerCase())
      );
      setBankSuggestions(filtered);
      setIsSearchingBanks(false);
    } else {
      setBankSuggestions([]);
    }
  }, [bankSearch, allBanks]);

  // Fetch referral code and link
  useEffect(() => {
    const fetchAndAssignReferralCode = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            let referralCode = userDoc.data()?.referral_code;
            if (!referralCode) {
              referralCode = await assignReferralCode(currentUser.uid);
              await updateDoc(userDocRef, { referral_code: referralCode });
            }
            const domain =
              process.env.NODE_ENV === "development"
                ? "http://localhost:3000"
                : "https://www.smsglobe.net";
            setReferralLink(`${domain}/invite/${referralCode}`);

            // Set user details for email
            setUserEmail(currentUser.email || "");
            setUserName(userDoc.data()?.name || "");
          }
        } catch (error) {
          console.error("Error fetching or assigning referral code:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAndAssignReferralCode();
  }, []);

  // Fetch invited users and calculate commission
  const fetchInvitedUsers = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const refersCollection = collection(db, "refers");
        const q = query(
          refersCollection,
          where("refer_by_email", "==", currentUser.email)
        );
        const querySnapshot = await getDocs(q);
        let total = 0;
        const users = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const commission = data.commission || 0;
          total += commission;
          return {
            id: doc.id,
            name: data.user_name,
            email: data.user_email,
            referDate: new Date(data.refer_date.toDate()).toLocaleString(),
            status:
              commission > 0
                ? `Commission: $${(commission / exchangeRate).toFixed(2)} USD`
                : "Waiting for deposit",
            commission,
          };
        });
        setInvitedUsers(users);
        setTotalCommission(total);
      } catch (error) {
        console.error("Error fetching invited users:", error);
      } finally {
        setFetchingInvites(false);
      }
    }
  };

  useEffect(() => {
    fetchInvitedUsers();
  }, [exchangeRate]);

  // Handle bank selection
  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setBankName(bank.name);
    setSelectedBankCode(bank.code.replace(/\D/g, ""));
  };

  // Verify account details
  const handleVerifyAccount = async () => {
    if (!accountNumber || !selectedBankCode) {
      alert("Please provide both account number and bank name.");
      return;
    }

    setVerifyingAccount(true);
    try {
      const response = await fetch("/api/proxy-pay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_number: accountNumber,
          account_bank: selectedBankCode,
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setAccountName(data.data.account_name);
      } else {
        setAccountName(null);
        alert(`Account verification failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      alert("An error occurred while verifying the account.");
    } finally {
      setVerifyingAccount(false);
    }
  };

  // Send email notification
  const sendWithdrawalEmail = async (amount: number) => {
    const templateId = isUSAccount
      ? "template_wallet_withdrawal"
      : "template_bank_withdrawal";
    const userTemplateParams = {
      to_name: userName,
      to_email: userEmail,
      amount: amount.toFixed(2),
      currency: "USD",
      ngn_amount: (amount * exchangeRate).toFixed(2),
      wallet_address: walletAddress,
      wallet_type: walletType,
      bank_name: selectedBank?.name || "",
      account_number: accountNumber,
      account_name: accountName || "",
      date: new Date().toLocaleString(),
      user_name: userName,
      user_email: userEmail,
    };

    try {
      // Send email to user
      await emailjs.send(
        "service_fcfp3h6",
        templateId,
        userTemplateParams,
        "rHzdi_ODUDr3TnYNl"
      );

      // Send email to admin
      await emailjs.send(
        "service_fcfp3h6",
        "template_admin_notification",
        userTemplateParams,
        "rHzdi_ODUDr3TnYNl"
      );
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  };

  // Handle withdrawal and update referral balance
  const handleWithdraw = async () => {
    if (isUSAccount && (!walletType || !walletAddress)) {
      alert("Please provide both wallet type and address.");
      return;
    }

    if (!isUSAccount && (!accountName || !selectedBankCode || !accountNumber)) {
      alert("Please verify your account details before withdrawing.");
      return;
    }

    const minWithdrawal = isUSAccount ? 10 : 100 / exchangeRate;
    const maxWithdrawal = totalCommission / exchangeRate;

    if (withdrawAmount < minWithdrawal || withdrawAmount > maxWithdrawal) {
      alert(
        `Withdrawal amount must be between ${minWithdrawal.toFixed(
          2
        )} USD and ${maxWithdrawal.toFixed(2)} USD`
      );
      return;
    }

    setWithdrawing(true);
    try {
      // First update the referral balance in Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          referral_balance: totalCommission - withdrawAmount * exchangeRate,
        });
      }

      // Send email notification
      await sendWithdrawalEmail(withdrawAmount);

      alert(
        "Withdrawal request submitted successfully! You'll receive your funds within 24-48 hours."
      );
      setTotalCommission((prev) => prev - withdrawAmount * exchangeRate);
      setWithdrawAmount(0);

      // Clear form fields
      if (isUSAccount) {
        setWalletAddress("");
        setWalletType("");
      } else {
        setAccountNumber("");
        setAccountName(null);
        setSelectedBank(null);
      }

      // Refresh the invited users to reflect the new balance
      await fetchInvitedUsers();
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert(
        "An error occurred while processing your withdrawal. Please try again."
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => alert("Failed to copy the referral link."));
  };

  // Custom option component for bank select with logos
  const BankOption = ({ innerProps, label, data }: any) => (
    <div
      {...innerProps}
      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
    >
      {data.logo ? (
        <img
          src={data.logo}
          alt={label}
          className="w-6 h-6 mr-2 rounded-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span className="w-6 h-6 mr-2 flex items-center justify-center">
          🏦
        </span>
      )}
      <span>{label}</span>
    </div>
  );

  // Custom single value component for bank select
  const BankSingleValue = ({ data }: any) => (
    <div className="flex items-center">
      {data.logo ? (
        <img
          src={data.logo}
          alt={data.name}
          className="w-6 h-6 mr-2 rounded-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span className="w-6 h-6 mr-2 flex items-center justify-center">
          🏦
        </span>
      )}
      <span>{data.name}</span>
    </div>
  );

  // Format email for display
  const formatEmail = (email: string) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    if (!username || !domain) return email;

    const maskedUsername =
      username.length > 3
        ? username.substring(0, 3) + "****"
        : username + "****";

    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Exchange Rate Display */}
      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-yellow-800">
            Current Exchange Rate
          </p>
          <p className="text-xs text-yellow-600">
            {rateLoading
              ? "Fetching rate..."
              : rateError || `1 USD = ${exchangeRate.toFixed(2)} NGN`}
          </p>
        </div>
        {rateLoading && <FaSpinner className="animate-spin text-yellow-500" />}
      </div>

      {/* Referral Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Your Referral Program
        </h3>
        <p className="text-gray-600 mb-4 sm:mb-6">
          Share your referral link and earn 5% commission on all deposits from
          your invited users.
        </p>

        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Your Referral Link
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={
                loading ? "Generating your referral link..." : referralLink
              }
              className="flex-1 p-2 sm:p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 truncate text-sm sm:text-base"
            />
            <button
              onClick={copyToClipboard}
              disabled={loading || copySuccess}
              className={`p-2 sm:p-3 rounded-lg flex items-center justify-center ${
                copySuccess
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              } transition-colors`}
            >
              {copySuccess ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* US Account Checkbox */}
      <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isUSAccount}
            onChange={(e) => setIsUSAccount(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">My account is US-based</span>
        </label>

        {isUSAccount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Type
              </label>
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                className="w-full p-2 sm:p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select wallet type</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">USDT (ERC20)</option>
                <option value="USDT-TRC20">USDT (TRC20)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="BUSD">Binance USD (BUSD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <input
                type="text"
                placeholder="Enter your wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full p-2 sm:p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Please double-check your wallet address. Funds sent to wrong
                addresses cannot be recovered.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Commission Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6">
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
              Your Earnings
            </h4>
            <p className="text-gray-600">Total commission from referrals</p>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-2 sm:mt-0">
            ${(totalCommission / exchangeRate).toFixed(2)} USD
          </div>
        </div>

        {totalCommission > 0 && (
          <div className="space-y-4">
            {!isUSAccount && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bank Select with React Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <Select
                    options={allBanks}
                    value={selectedBank}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        handleSelectBank(selectedOption);
                      }
                    }}
                    onInputChange={(inputValue) => {
                      setBankSearch(inputValue);
                      setBankName(inputValue);
                    }}
                    placeholder="Search for your bank..."
                    isSearchable
                    components={{
                      Option: BankOption,
                      SingleValue: BankSingleValue,
                    }}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.code}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isLoading={isSearchingBanks}
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2 sm:p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Selected Bank Info */}
            {selectedBank && !isUSAccount && (
              <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                {selectedBank.logo ? (
                  <img
                    src={selectedBank.logo}
                    alt={selectedBank.name}
                    className="w-8 h-8 rounded-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center text-xl">
                    🏦
                  </span>
                )}
                <div>
                  <p className="font-medium">{selectedBank.name}</p>
                  <p className="text-sm text-gray-600">
                    Code: {selectedBank.code}
                  </p>
                </div>
              </div>
            )}

            {/* Account Verification */}
            {accountName && !isUSAccount && (
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
                <p className="text-green-700 font-medium">
                  Verified Account:{" "}
                  <span className="font-normal">{accountName}</span>
                </p>
              </div>
            )}

            {/* Wallet Address Display */}
            {isUSAccount && walletAddress && (
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                <p className="text-blue-700 font-medium">
                  Wallet Address:{" "}
                  <span className="font-mono break-all">{walletAddress}</span>
                </p>
                <p className="text-sm text-blue-600 mt-1">Type: {walletType}</p>
              </div>
            )}

            {/* Withdrawal Amount */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount (Min:{" "}
                {isUSAccount ? "$10" : `$${(100 / exchangeRate).toFixed(2)}`},
                Max: ${(totalCommission / exchangeRate).toFixed(2)} USD)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  className="flex-1 p-2 sm:p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={isUSAccount ? 10 : 100 / exchangeRate}
                  max={totalCommission / exchangeRate}
                  step="0.01"
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  required
                />
                <span className="text-gray-500">USD</span>
              </div>
              {withdrawAmount > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    Equivalent: {(withdrawAmount * exchangeRate).toFixed(2)} NGN
                  </p>
                  <p>
                    You&apos;ll receive: ${(withdrawAmount * 0.95).toFixed(2)}{" "}
                    USD (after 5% processing fee)
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!isUSAccount && (
                <button
                  onClick={handleVerifyAccount}
                  disabled={verifyingAccount || !selectedBank || !accountNumber}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {verifyingAccount ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FiCreditCard />
                      Verify Account
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleWithdraw}
                disabled={
                  withdrawing ||
                  (isUSAccount
                    ? !walletType || !walletAddress
                    : !accountName || !selectedBankCode) ||
                  withdrawAmount < (isUSAccount ? 10 : 100 / exchangeRate) ||
                  withdrawAmount > totalCommission / exchangeRate
                }
                className={`flex-1 ${
                  isUSAccount
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm sm:text-base`}
              >
                {withdrawing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiDollarSign />
                    {isUSAccount ? "Request Withdrawal" : "Withdraw Funds"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Invited Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200"
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800">
            Your Invited Users
          </h4>
          <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
            Total: {invitedUsers.length}
          </span>
        </div>

        {fetchingInvites ? (
          <div className="flex justify-center py-4 sm:py-8">
            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          </div>
        ) : invitedUsers.length === 0 ? (
          <div className="text-center py-4 sm:py-8">
            <p className="text-gray-500 mb-2">
              You haven&apos;t invited any users yet
            </p>
            <p className="text-sm text-gray-400">
              Share your referral link to invite users and start earning
              commissions
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitedUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <FiUser />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatEmail(user.email)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiCalendar className="mr-1" />
                        {user.referDate}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.commission > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Refer;
