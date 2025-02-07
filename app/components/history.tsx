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
              date: data.date.toDate().toISOString(), // Ensure date is correctly formatted
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

  // const formatDate = (dateString: string): string => {
  //   const date = new Date(dateString);
  //   return date.toLocaleString("en-GB", {
  //     day: "2-digit",
  //     month: "long",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   });
  // };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <AiOutlineCheckCircle style={{ color: "green" }} />;
      case "failed":
        return <AiOutlineCloseCircle style={{ color: "red" }} />;
      case "pending":
        return <AiOutlineClockCircle style={{ color: "orange" }} />;
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
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Deposit History</h1>
      <h2>Total Deposit: {formatCurrency(totalDeposit)}</h2>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "5px",
        }}
      >
        <button
          onClick={() => handleSort("date")}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Sort by Date
        </button>
        <button
          onClick={() => handleSort("amount")}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Sort by Amount
        </button>
        <button
          onClick={() => handleSort("status")}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Sort by Status
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        {history.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div style={{ flex: 1, fontSize: "10px" }}>{item.date}</div>
            <div style={{ flex: 1 }}>{formatCurrency(item.amount)}</div>
            <div style={{ flex: 1 }}>{item.mode}</div>
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              {getStatusIcon(item.status)}
              <span style={{ marginLeft: "8px" }}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>

      <CryptoData />
    </div>
  );
};

export default History;
