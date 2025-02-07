"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig"; // Import your Firebase config
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DepositChart from "./depositChart";

const Rewards: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [rewardData, setRewardData] = useState<
    { status: string; count: number }[]
  >([]);
  const [commissionTrend, setCommissionTrend] = useState<
    { date: string; commission: number }[]
  >([]);

  useEffect(() => {
    const fetchReferralData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // Fetch the user's name
        setUserName(currentUser.displayName || "User");

        // Query referrals data
        const referCollection = collection(db, "refers");
        const q = query(
          referCollection,
          where("refer_by_email", "==", currentUser.email)
        );
        const querySnapshot = await getDocs(q);

        const rawData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            status:
              data.commission > 0 ? "Commission Earned" : "Waiting for Deposit",
            commission: data.commission || 0,
            date: new Date(data.refer_date.toDate())
              .toISOString()
              .split("T")[0], // Convert date to YYYY-MM-DD
          };
        });

        // Process data for PieChart
        const statusCounts: { [key: string]: number } = {};
        rawData.forEach((item) => {
          statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
        });
        setRewardData(
          Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
          }))
        );

        // Process data for BarChart (Commission Over Time)
        const dateWiseCommission: { [key: string]: number } = {};
        rawData.forEach((item) => {
          dateWiseCommission[item.date] =
            (dateWiseCommission[item.date] || 0) + item.commission;
        });
        setCommissionTrend(
          Object.entries(dateWiseCommission).map(([date, commission]) => ({
            date,
            commission,
          }))
        );
      } catch (error) {
        console.error("Error fetching referral data:", error);
      }
    };

    fetchReferralData();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]; // For PieChart

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Rewards Chart</h3>
      <p className="text-gray-600 mb-4">
        Hello, {userName}! Check out your earned rewards below:
      </p>

      <div className="mb-8">
        <h4 className="text-md font-semibold mb-2">
          Referral Status Breakdown
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={rewardData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={(entry) => `${entry.status}: ${entry.count}`}
            >
              {rewardData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-8">
        <h4 className="text-md font-semibold mb-2">
          Commission Earned Over Time
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={commissionTrend}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="commission"
              fill="#82ca9d"
              label={{ position: "top" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="font-bold p-2">Deposit chart</h2>
      <section>
        <DepositChart />
      </section>
    </div>
  );
};

export default Rewards;
