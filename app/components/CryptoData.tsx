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
import { FaCopy, FaDownload } from "react-icons/fa";
import { jsPDF } from "jspdf";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

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

          setTransactions(transactionsData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching transactions:", error);
          setLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadAsTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(transactions, null, 2)], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "transactions.txt";
    document.body.appendChild(element);
    element.click();
  };

  const downloadAsPdf = () => {
    const doc = new jsPDF();
    let y = 10;
    transactions.forEach((transaction, index) => {
      doc.text(`Transaction ${index + 1}`, 10, y);
      doc.text(`Order ID: ${transaction.order_id}`, 10, y + 10);
      doc.text(`Amount: ${transaction.amount}`, 10, y + 20);
      doc.text(`Currency: ${transaction.currency}`, 10, y + 30);
      doc.text(`Status: ${transaction.payment_status}`, 10, y + 40);
      doc.text(
        `Created At: ${new Date(transaction.created_at).toLocaleString()}`,
        10,
        y + 50
      );
      doc.text(
        `Updated At: ${new Date(transaction.updated_at).toLocaleString()}`,
        10,
        y + 60
      );
      y += 70;
    });
    doc.save("transactions.pdf");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4 max-w-5x2">
      <h2 className="text-2xl font-bold mb-4">Crypto Transactions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Currency</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Updated At</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.uuid}>
                <td className="py-2 px-4 border-b flex items-center">
                  {transaction.order_id}
                  <button
                    onClick={() => copyToClipboard(transaction.order_id)}
                    className="ml-2 text-blue-500"
                  >
                    <FaCopy />
                  </button>
                </td>
                <td className="py-2 px-4 border-b">{transaction.amount}</td>
                <td className="py-2 px-4 border-b">{transaction.currency}</td>
                <td className="py-2 px-4 border-b">
                  {transaction.payment_status}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(transaction.created_at).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(transaction.updated_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="relative mt-4">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 bg-green-500 text-white rounded"
        >
          <FaDownload className="inline mr-2" /> Download
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
            <button
              onClick={downloadAsTxt}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Save as TXT
            </button>
            <button
              onClick={downloadAsPdf}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Save as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoData;
