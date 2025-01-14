"use client";

import React, { useEffect, useState } from "react";
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
import { FaCopy, FaCheck } from "react-icons/fa";
import { assignReferralCode } from "../utils/referralUtils";

const Refer: React.FC = () => {
  const [referralLink, setReferralLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [invitedUsers, setInvitedUsers] = useState<
    {
      name: string;
      email: string;
      referDate: string;
      status: string;
      commission: number;
    }[]
  >([]);
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

  useEffect(() => {
    const fetchAndAssignReferralCode = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            let referralCode = userDoc.data()?.referral_code;

            if (referralCode === undefined) {
              referralCode = await assignReferralCode(currentUser.uid);
            } else if (!referralCode) {
              await updateDoc(userDocRef, {
                referral_code: await assignReferralCode(currentUser.uid),
              });
              referralCode = (await getDoc(userDocRef)).data()?.referral_code;
            }

            if (referralCode) {
              const domain =
                process.env.NODE_ENV === "development"
                  ? "http://localhost:3000"
                  : "https://www.smsglobe.net";
              setReferralLink(`${domain}/invite/${referralCode}`);
            }
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

  const fetchBankSuggestions = async () => {
    try {
      const response = await fetch("/api/proxy-pay/banks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: bankName }),
      });

      const data = await response.json();

      if (data.status === "success") {
        // Ensure the structure is { name: string, code: string }
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

  const handleBankInputChange = (value: string) => {
    setBankName(value);
    if (value.length >= 2) {
      fetchBankSuggestions();
    } else {
      setBankSuggestions([]);
    }
  };

  const handleSelectBank = (bank: { name: string; code: string }) => {
    const numericCode = bank.code.replace(/\D/g, ""); // Remove non-numeric characters
    setBankName(bank.name);
    setSelectedBankCode(numericCode);
    setBankSuggestions([]); // Clear suggestions after selection
  };

  const handleVerifyAccount = async () => {
    if (!accountNumber || !selectedBankCode) {
      alert("Please provide both account number and bank name.");
      return;
    }

    // Ensure the selectedBankCode is numeric
    const sanitizedBankCode = selectedBankCode.trim().replace(/\D/g, ""); // Remove any non-numeric characters
    console.log("Sanitized Bank Code:", sanitizedBankCode);

    if (isNaN(Number(sanitizedBankCode))) {
      alert("Invalid bank code. Please select a valid bank.");
      return;
    }

    setVerifyingAccount(true);

    try {
      const response = await fetch("/api/proxy-pay/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_number: accountNumber,
          account_bank: sanitizedBankCode, // Use sanitized bank code
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setAccountName(data.data.account_name);
        alert(`Account verified: ${data.data.account_name}`);
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

    setWithdrawing(true);

    try {
      const response = await fetch("/api/proxy-pay/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_bank: selectedBankCode,
          account_number: accountNumber,
          amount: totalCommission,
          narration: "Commission withdrawal",
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Withdrawal successful!");
        setTotalCommission(0); // Reset commission after successful withdrawal
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

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Referral</h3>
      <p className="text-gray-600 mb-4">
        Share your referral link with your friends to earn rewards!
      </p>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm mb-2">Your Referral Link:</p>
        <div className="flex items-center justify-between">
          <span
            className="text-sm text-gray-500 truncate overflow-hidden max-w-[80%]"
            title={loading ? "Loading..." : referralLink} // Tooltip for full link on hover
          >
            {loading ? "Loading..." : referralLink}
          </span>
          <button
            onClick={() => {
              if (!referralLink) return;
              navigator.clipboard
                .writeText(referralLink)
                .then(() => {
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                })
                .catch(() => alert("Failed to copy the referral link."));
            }}
            className="flex items-center gap-2 text-blue-500 text-sm"
            disabled={!referralLink || copySuccess} // Disable while copy is in progress
          >
            {copySuccess ? (
              <>
                <FaCheck className="text-green-500" />
                Copied
              </>
            ) : (
              <>
                <FaCopy />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-semibold">Total Commission</h4>
        <p className="text-lg text-green-500">{totalCommission} NGN</p>
        {totalCommission > 0 && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Bank Name"
              value={bankName}
              onChange={(e) => handleBankInputChange(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            {bankSuggestions.length > 0 && (
              <ul className="border rounded bg-white max-h-40 overflow-y-auto">
                {bankSuggestions.map((bank, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleSelectBank(bank)}
                  >
                    {bank.name}
                  </li>
                ))}
              </ul>
            )}

            <input
              type="text"
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <button
              onClick={handleVerifyAccount}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
              disabled={verifyingAccount}
            >
              {verifyingAccount ? "Verifying..." : "Verify Account"}
            </button>
            {accountName && (
              <p className="text-sm text-green-500">
                Account Name: {accountName}
              </p>
            )}
            <button
              onClick={handleWithdraw}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={withdrawing}
            >
              {withdrawing ? "Processing..." : "Withdraw"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h4 className="text-md font-semibold">Your Invited Users</h4>
        {fetchingInvites ? (
          <p className="text-gray-500 mt-4">Loading invited users...</p>
        ) : invitedUsers.length === 0 ? (
          <div className="text-gray-500 mt-4">
            <p>You have not invited any users yet.</p>
            <p className="text-sm mt-2">
              Share your referral link to invite users and earn a 5% commission
              on their first deposit.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            {invitedUsers.map((user, index) => {
              const truncatedEmail = user.email.replace(
                /^(.{3}).+(.{3}@.+)$/,
                "$1......$2"
              );

              return (
                <div
                  key={index}
                  className="flex justify-between bg-white p-3 rounded-lg mb-2 shadow"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{truncatedEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{user.referDate}</p>
                    <p className="text-sm text-blue-500">{user.status}</p>
                  </div>
                </div>
              );
            })}

            <p className="text-sm text-gray-500 mt-4">
              You will earn a 5% commission on the first deposit of each invited
              user. Your earnings are withdrawable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Refer;
