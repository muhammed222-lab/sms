/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  FaCopy,
  FaDownload,
  FaSearch,
  FaShare,
  FaFilePdf,
  FaFileAlt,
  FaFileCsv,
} from "react-icons/fa";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface CryptoTransaction {
  address: string;
  amount: string;
  created_at: string;
  currency: string;
  discount: string;
  expired_at: string;
  from: string;
  is_final: string;
  order_id: string;
  payer_currency: string;
  payer_email: string;
  payment_status: string;
  txid: string;
  updated_at: string;
  uuid: string;
}

const CryptoData: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    CryptoTransaction[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        try {
          const email = user.email || "default@example.com";
          const q = query(
            collection(db, "crypto_payment_history"),
            where("payer_email", "==", email)
          );
          const querySnapshot = await getDocs(q);

          const transactionsData: CryptoTransaction[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            const transaction: CryptoTransaction = {
              address: data.address,
              amount: data.amount,
              created_at: data.created_at,
              currency: data.currency,
              discount: data.discount,
              expired_at: data.expired_at,
              from: data.from,
              is_final: data.is_final,
              order_id: data.order_id,
              payer_currency: data.payer_currency,
              payer_email: data.payer_email,
              payment_status: data.payment_status,
              txid: data.txid,
              updated_at: data.updated_at,
              uuid: data.uuid,
            };
            transactionsData.push(transaction);
          });

          // Sort by date (newest first)
          transactionsData.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

          setTransactions(transactionsData);
          setFilteredTransactions(transactionsData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching transactions:", error);
          setLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(
        (transaction) =>
          transaction.order_id
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.currency
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.payment_status
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.txid.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  }, [searchTerm, transactions]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const shareTransaction = (transaction: CryptoTransaction) => {
    const shareData = {
      title: `Transaction ${transaction.order_id}`,
      text: `Crypto Transaction Details:
Order ID: ${transaction.order_id}
Amount: ${transaction.amount} ${transaction.currency}
Status: ${transaction.payment_status}
Date: ${formatDate(transaction.created_at)}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      copyToClipboard(shareData.text);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadAsPdf = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Crypto Transactions", 14, 15);

    // Prepare data for the table
    const tableData = filteredTransactions.map((transaction) => [
      transaction.order_id,
      `${transaction.amount} ${transaction.currency}`,
      transaction.payment_status,
      formatDate(transaction.created_at),
      formatDate(transaction.updated_at),
    ]);

    // Use autoTable directly
    autoTable(doc, {
      head: [["Order ID", "Amount", "Status", "Created At", "Updated At"]],
      body: tableData,
      startY: 25,
      styles: {
        cellPadding: 3,
        fontSize: 10,
        valign: "middle",
        halign: "left",
      },
      headStyles: {
        fillColor: "#3B82F6",
        textColor: "#FFFFFF",
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: "#F3F4F6",
      },
    });

    doc.save("crypto_transactions.pdf");
    setShowDropdown(false);
  };

  const downloadAsCsv = () => {
    const csvData = filteredTransactions.map((transaction) => ({
      "Order ID": transaction.order_id,
      Amount: transaction.amount,
      Currency: transaction.currency,
      Status: transaction.payment_status,
      "Created At": formatDate(transaction.created_at),
      "Updated At": formatDate(transaction.updated_at),
      "Transaction ID": transaction.txid,
    }));

    return csvData;
  };

  const toggleRowSelection = (uuid: string) => {
    setSelectedRows((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ToastContainer />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Crypto Transactions
        </h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaDownload />
              <span className="hidden sm:inline">Export</span>
              {showDropdown ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <CSVLink
                    data={downloadAsCsv()}
                    filename="crypto_transactions.csv"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaFileCsv className="text-green-600" />
                    Download as CSV
                  </CSVLink>
                  <button
                    onClick={downloadAsPdf}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    <FaFilePdf className="text-red-600" />
                    Download as PDF
                  </button>
                  <button
                    onClick={() => {
                      copyToClipboard(
                        JSON.stringify(filteredTransactions, null, 2)
                      );
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    <FaFileAlt className="text-blue-600" />
                    Copy as Text
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "No transactions match your search"
              : "No transactions found"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Updated At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.uuid}
                    className={`hover:bg-gray-50 ${
                      selectedRows.includes(transaction.uuid)
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {transaction.order_id}
                        </span>
                        <button
                          onClick={() => copyToClipboard(transaction.order_id)}
                          className="ml-2 text-gray-400 hover:text-blue-600"
                          aria-label="Copy order ID"
                        >
                          <FaCopy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {transaction.amount} {transaction.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.payment_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => shareTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          aria-label="Share transaction"
                        >
                          <FaShare size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredTransactions.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </div>
      )}
    </div>
  );
};

export default CryptoData;
