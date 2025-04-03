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
import { FaCopy, FaCheck, FaSearch, FaSpinner, FaTimes } from "react-icons/fa";
import { assignReferralCode } from "../utils/referralUtils";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiDollarSign, FiCalendar, FiCreditCard } from "react-icons/fi";
import debounce from "lodash.debounce";

const Refer: React.FC = () => {
  const [referralLink, setReferralLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [invitedUsers, setInvitedUsers] = useState<any[]>([]);
  const [fetchingInvites, setFetchingInvites] = useState<boolean>(true);
  const [totalCommission, setTotalCommission] = useState<number>(0);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [bankSuggestions, setBankSuggestions] = useState<
    { name: string; code: string }[]
  >([]);
  const [selectedBankCode, setSelectedBankCode] = useState<string>("");
  const [accountName, setAccountName] = useState<string | null>(null);
  const [verifyingAccount, setVerifyingAccount] = useState<boolean>(false);
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [showBankDropdown, setShowBankDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allBanks, setAllBanks] = useState<{ name: string; code: string }[]>(
    []
  );
  const [isSearchingBanks, setIsSearchingBanks] = useState(false);
  useEffect(() => {
    const loadAllBanks = async () => {
      try {
        const response = await fetch("/api/proxy-pay/banks");
        const data = await response.json();
        if (data.status === "success") {
          setAllBanks(
            data.banks.map((bank: { name: string; code: string }) => ({
              name: bank.name,
              code: bank.code,
            }))
          );
        }
      } catch (error) {
        console.error("Error loading banks:", error);
      }
    };
    loadAllBanks();
  }, []);

  // Filter banks based on search query
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearchingBanks(true);
      const filtered = allBanks.filter((bank) =>
        bank.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setBankSuggestions(filtered);
      setIsSearchingBanks(false);
      setShowBankDropdown(true);
    } else {
      setBankSuggestions([]);
      setShowBankDropdown(false);
    }
  }, [searchQuery, allBanks]);

  // Removed duplicate declaration of handleBankSearch

  // Removed duplicate declaration of handleSelectBank

  const clearSearch = () => {
    setBankName("");
    setSearchQuery("");
    setBankSuggestions([]);
    setShowBankDropdown(false);
  };

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
            name: data.user_name,
            email: data.user_email,
            referDate: new Date(data.refer_date.toDate()).toLocaleString(),
            status:
              commission > 0
                ? `Commission: ${commission} NGN`
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
  }, []);

  const fetchBankSuggestions = async (query: string) => {
    try {
      const response = await fetch("/api/proxy-pay/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setBankSuggestions(
          data.banks.map((bank: { name: string; code: string }) => ({
            name: bank.name,
            code: bank.code,
          }))
        );
      } else {
        setBankSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching bank suggestions:", error);
      setBankSuggestions([]);
    }
  };

  const handleBankSearch = (value: string) => {
    setBankName(value);
    setSearchQuery(value);
    if (value.length >= 2) {
      setShowBankDropdown(true);
      debouncedBankSearch(value);
    } else {
      setShowBankDropdown(false);
      setBankSuggestions([]);
    }
  };
  // Simple debounce function
  function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
  const handleSelectBank = (bank: { name: string; code: string }) => {
    setBankName(bank.name);
    setSelectedBankCode(bank.code.replace(/\D/g, ""));
    setShowBankDropdown(false);
    setSearchQuery("");
  };

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

  const handleWithdraw = async () => {
    if (!accountName || !selectedBankCode || !accountNumber) {
      alert("Please verify your account details before withdrawing.");
      return;
    }

    if (withdrawAmount < 100 || withdrawAmount > totalCommission) {
      alert(
        `Withdrawal amount must be between 100 NGN and ${totalCommission} NGN`
      );
      return;
    }

    setWithdrawing(true);
    try {
      const response = await fetch("/api/proxy-pay/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_bank: selectedBankCode,
          account_number: accountNumber,
          amount: withdrawAmount,
          narration: "Commission withdrawal",
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("Withdrawal successful!");
        setTotalCommission((prev) => prev - withdrawAmount);
        setWithdrawAmount(0);
      } else {
        alert(`Withdrawal failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert("An error occurred while processing your withdrawal.");
    } finally {
      setWithdrawing(false);
    }
  };
  const debouncedBankSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        try {
          const response = await fetch("/api/proxy-pay/banks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          const data = await response.json();
          if (data.status === "success") {
            setBankSuggestions(
              data.banks.map((bank: { name: string; code: string }) => ({
                name: bank.name,
                code: bank.code,
              }))
            );
          } else {
            setBankSuggestions([]);
          }
        } catch (error) {
          console.error("Error fetching bank suggestions:", error);
          setBankSuggestions([]);
        }
      } else {
        setBankSuggestions([]);
      }
    }, 300),
    []
  );
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

  return (
    <div className="max-w-4xl mx-auto p-[5px]">
      {/* Referral Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-[10px] mb-8"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Your Referral Program
        </h3>
        <p className="text-gray-600 mb-6">
          Share your referral link and earn 5% commission on all deposits from
          your invited users.
        </p>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
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
              className="flex-1 p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 truncate"
            />
            <button
              onClick={copyToClipboard}
              disabled={loading || copySuccess}
              className={`p-3 rounded-lg flex items-center justify-center ${
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

      {/* Commission Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl p-[10px] mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-1">
              Your Earnings
            </h4>
            <p className="text-gray-600">Total commission from referrals</p>
          </div>
          <div className="text-3xl font-bold text-green-600 mt-4 md:mt-0">
            {totalCommission.toLocaleString()} NGN
          </div>
        </div>

        {totalCommission > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank Search */}
              {/* Fixed Bank Search Component */}
              <div className="relative mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for your bank..."
                    value={bankName}
                    onChange={(e) => handleBankSearch(e.target.value)}
                    className="w-full p-3 pl-10 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onFocus={() =>
                      searchQuery.length >= 2 && setShowBankDropdown(true)
                    }
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                  {bankName && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {isSearchingBanks && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex justify-center"
                    >
                      <FaSpinner className="animate-spin text-blue-500" />
                    </motion.div>
                  )}

                  {showBankDropdown && bankSuggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto max-h-60"
                    >
                      {bankSuggestions.map((bank) => (
                        <motion.li
                          key={bank.code}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSelectBank(bank)}
                        >
                          {bank.name}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}

                  {showBankDropdown &&
                    bankSuggestions.length === 0 &&
                    searchQuery.length >= 2 &&
                    !isSearchingBanks && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-gray-500"
                      >
                        No banks found matching &quot;{searchQuery}&quot;
                      </motion.div>
                    )}
                </AnimatePresence>
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
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Account Verification */}
            {accountName && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-700 font-medium">
                  Verified Account:{" "}
                  <span className="font-normal">{accountName}</span>
                </p>
              </div>
            )}

            {/* Withdrawal Amount */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount (Min: 100 NGN, Max:{" "}
                {totalCommission.toLocaleString()} NGN)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={100}
                  max={totalCommission}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                />
                <span className="text-gray-500">NGN</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleVerifyAccount}
                disabled={verifyingAccount || !bankName || !accountNumber}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
              <button
                onClick={handleWithdraw}
                disabled={
                  withdrawing ||
                  !accountName ||
                  withdrawAmount < 100 ||
                  withdrawAmount > totalCommission
                }
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {withdrawing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiDollarSign />
                    Withdraw Funds
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
        className=" rounded-xl"
      >
        <h4 className="text-xl font-bold text-gray-800 mb-6">
          Your Invited Users
        </h4>

        {fetchingInvites ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          </div>
        ) : invitedUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">
              You haven&lsquo;t invited any users yet
            </p>
            <p className="text-sm text-gray-400">
              Share your referral link to invite users and start earning
              commissions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitedUsers.map((user, index) => {
              const truncatedEmail = user.email.replace(
                /^(.{3}).+(.{3}@.+)$/,
                "$1......$2"
              );
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                      <FiUser />
                    </div>
                    <div>
                      <p className="font-medium">{user.name || "Anonymous"}</p>
                      <p className="text-sm text-gray-500">{truncatedEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                      <FiCalendar />
                      {user.referDate}
                    </p>
                    <p
                      className={`text-sm ${
                        user.commission > 0 ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {user.status}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Refer;
