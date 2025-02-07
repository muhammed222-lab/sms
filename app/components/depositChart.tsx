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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DepositHistory {
  user_email: string;
  amount: number;
  date: string;
  mode: string;
  status: string;
}

const DepositChart: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<DepositHistory[]>([]);

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
          });

          setHistory(historyData);
        } catch (error) {
          console.error("Error fetching deposit history:", error);
        }
      }
    };

    fetchDepositHistory();
  }, [user]);

  const formattedData = history.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-GB"),
    amount: item.amount,
  }));

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Deposit Chart</h1>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepositChart;
