/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/rent/OrdersTab.tsx
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
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

  // Fetch orders when userEmail changes
  useEffect(() => {
    if (!userEmail) return;
    fetchOrders();
  }, [userEmail]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersQuery = query(
        collection(db, "rentals"),
        where("user_email", "==", userEmail)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      setMessage("Error fetching orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function checkOrder(order_id: any): void {
    throw new Error("Function not implemented.");
  }

  function finishOrder(order_id: any): void {
    throw new Error("Function not implemented.");
  }

  function cancelOrder(order_id: any): void {
    throw new Error("Function not implemented.");
  }

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
