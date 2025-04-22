/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/rent/OrdersTab.tsx
// components/rent/OrdersTab.tsx
// components/rent/OrdersTab.tsx
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import OrderList from "./OrderList";
import OrderDetail from "./OrderDetail";

interface OrdersTabProps {
  userEmail: string;
  rubleToUSDRate: number;
  balance: number;
  setMessage: (message: string) => void;
  setBalance: (balance: number) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  userEmail,
  rubleToUSDRate,
  balance,
  setMessage,
  setBalance,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userEmail) return;
    fetchOrders();
  }, [userEmail]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // First get all orders for the user
      const ordersQuery = query(
        collection(db, "rentals"),
        where("user_email", "==", userEmail)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Ensure createdAt exists, fallback to current time if not
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      // Sort manually in JavaScript
      ordersData.sort((a, b) => b.createdAt - a.createdAt);

      // Add relative time labels
      const ordersWithTimeLabels = ordersData.map((order) => ({
        ...order,
        timeLabel: getTimeLabel(order.createdAt),
      }));

      setOrders(ordersWithTimeLabels);
    } catch (error) {
      setMessage("Error fetching orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeLabel = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Orders</h2>
      {selectedOrder ? (
        <OrderDetail
          order={selectedOrder}
          onBack={() => setSelectedOrder(null)}
          setMessage={setMessage}
          setLoading={setLoading}
          fetchOrders={fetchOrders}
          setBalance={setBalance}
          userEmail={userEmail}
        />
      ) : (
        <OrderList
          orders={orders}
          loading={loading}
          onSelectOrder={setSelectedOrder}
          rubleToUSDRate={rubleToUSDRate}
          balance={balance}
        />
      )}
    </div>
  );
};
