import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineClockCircle,
} from "react-icons/ai";
import CryptoData from "./CryptoData";

interface DepositHistory {
  user_email: string;
  amount: number;
  date: string;
  mode: string;
  status: string;
}

const History: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<DepositHistory[]>([]);
  const [totalDeposit, setTotalDeposit] = useState<number>(0);
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDepositHistory = async () => {
      if (user) {
        try {
          const email = user.email || "default@example.com";
          const q = query(
            collection(db, "deposit_history"),
            where("user_email", "==", email)
          );
          const querySnapshot = await getDocs(q);

          const historyData: DepositHistory[] = [];
          let total = 0;

          querySnapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            const deposit: DepositHistory = {
              user_email: data.user_email,
              amount: parseFloat(data.amount),
              date: data.date.toDate().toISOString(),
              mode: data.mode,
              status: data.status,
            };
            historyData.push(deposit);
            total += parseFloat(data.amount);
          });

          setHistory(historyData);
          setTotalDeposit(total);
        } catch (error) {
          console.error("Error fetching deposit history:", error);
        }
      }
    };

    fetchDepositHistory();
  }, [user]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <AiOutlineCheckCircle className="text-green-500 text-xl" />;
      case "failed":
        return <AiOutlineCloseCircle className="text-red-500 text-xl" />;
      case "pending":
        return <AiOutlineClockCircle className="text-orange-500 text-xl" />;
      default:
        return null;
    }
  };

  const handleSort = (field: string) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    const sortedHistory = [...history].sort((a, b) => {
      if (field === "amount") {
        return order === "asc" ? a.amount - b.amount : b.amount - a.amount;
      } else if (field === "date") {
        return order === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return order === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });
    setHistory(sortedHistory);
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Deposit History</h1>
      <h2 className="text-lg text-gray-700">
        Total Deposit:{" "}
        <span className="text-green-600 font-semibold">
          {formatCurrency(totalDeposit)}
        </span>
      </h2>

      {/* Sorting Buttons */}
      <div className="mt-4 flex space-x-2">
        {["date", "amount", "status"].map((field) => (
          <button
            key={field}
            onClick={() => handleSort(field)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
          >
            Sort by {field.charAt(0).toUpperCase() + field.slice(1)}
          </button>
        ))}
      </div>

      {/* Deposit History Table */}
      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Mode</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {history.length > 0 ? (
              history.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition-all duration-200"
                >
                  <td className="p-3 text-sm text-gray-600">{item.date}</td>
                  <td className="p-3 text-sm font-semibold">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="p-3 text-sm text-gray-600">{item.mode}</td>
                  <td className="p-3 flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="capitalize">{item.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No deposit history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CryptoData />
    </div>
  );
};

export default History;
