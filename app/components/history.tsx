/* eslint-disable @typescript-eslint/no-unused-vars */
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
  AiOutlineSearch,
  AiOutlineSortAscending,
  AiOutlineSortDescending,
  AiOutlineEye,
} from "react-icons/ai";
import { formatDistanceToNow } from "date-fns";
import CryptoData from "./CryptoData";

interface DepositHistory {
  id: string;
  user_email: string;
  amount: number;
  date: string;
  mode: string;
  status: string;
  details?: string;
}

const History: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<DepositHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<DepositHistory[]>([]);
  const [totalDeposit, setTotalDeposit] = useState<number>(0);
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<DepositHistory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          setIsLoading(true);
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
              id: doc.id,
              user_email: data.user_email,
              amount: parseFloat(data.amount),
              date: data.date.toDate().toISOString(),
              mode: data.mode,
              status: data.status,
              details: data.details || "No additional details available",
            };
            historyData.push(deposit);
            total += parseFloat(data.amount);
          });

          setHistory(historyData);
          setFilteredHistory(historyData);
          setTotalDeposit(total);
        } catch (error) {
          console.error("Error fetching deposit history:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDepositHistory();
  }, [user]);

  useEffect(() => {
    // Filter history based on search query
    const filtered = history.filter(
      (item) =>
        item.mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.amount.toString().includes(searchQuery) ||
        formatDistanceToNow(new Date(item.date), { addSuffix: true })
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setFilteredHistory(filtered);
  }, [searchQuery, history]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <AiOutlineCheckCircle className="text-green-500 text-xl" />;
      case "failed":
        return <AiOutlineCloseCircle className="text-red-500 text-xl" />;
      case "pending":
        return <AiOutlineClockCircle className="text-yellow-500 text-xl" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSort = (field: string) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedHistory = [...filteredHistory].sort((a, b) => {
      if (field === "amount") {
        return order === "asc" ? a.amount - b.amount : b.amount - a.amount;
      } else if (field === "date") {
        return order === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return order === "asc"
          ? (a[field as keyof DepositHistory] as string).localeCompare(
              b[field as keyof DepositHistory] as string
            )
          : (b[field as keyof DepositHistory] as string).localeCompare(
              a[field as keyof DepositHistory] as string
            );
      }
    });
    setFilteredHistory(sortedHistory);
  };

  const openDetailsModal = (item: DepositHistory) => {
    setSelectedItem(item);
  };

  const closeDetailsModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">
              Transaction History
            </h1>
            <p className="mt-2 opacity-90">
              View all your deposit transactions
            </p>
          </div>

          {/* Stats and Search */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="bg-blue-50 rounded-lg p-4 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Total Deposits
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalDeposit)}
                </p>
              </div>

              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sorting Controls */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex flex-wrap gap-2">
              {["date", "amount", "status", "mode"].map((field) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1 ${
                    sortField === field
                      ? "bg-blue-100 text-blue-700"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field &&
                    (sortOrder === "asc" ? (
                      <AiOutlineSortAscending />
                    ) : (
                      <AiOutlineSortDescending />
                    ))}
                </button>
              ))}
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchQuery
                  ? "No transactions match your search"
                  : "No transactions found"}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <table className="hidden md:table w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">
                        Date & Time
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">
                        Amount
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">
                        Payment Method
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(item.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(item.date).toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.amount)}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {item.mode}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <button
                            onClick={() => openDetailsModal(item)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <AiOutlineEye />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile List */}
                <div className="md:hidden">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="border-b p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(item.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(item.date)}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-sm capitalize text-gray-700">
                          {item.mode}
                        </div>
                        <button
                          onClick={() => openDetailsModal(item)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <AiOutlineEye size={14} />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination would go here */}
        </div>

        <CryptoData />
      </div>

      {/* Transaction Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <AiOutlineCloseCircle size={24} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedItem.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedItem.date).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {selectedItem.mode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      selectedItem.status
                    )}`}
                  >
                    {selectedItem.status}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Additional Details
                  </h4>
                  <p className="text-gray-600">{selectedItem.details}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
