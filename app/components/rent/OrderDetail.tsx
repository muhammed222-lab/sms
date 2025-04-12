/* eslint-disable @typescript-eslint/no-explicit-any */
// components/rent/OrderDetail.tsx
import React from "react";
import { FiInfo } from "react-icons/fi";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

interface OrderDetailProps {
  order: any;
  onBack: () => void;
  setMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  fetchOrders: () => void;
  setBalance: (balance: number) => void;
  userEmail: string | null;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onBack,
  setMessage,
  setLoading,
  fetchOrders,
  setBalance,
  userEmail,
}) => {
  // Check order status
  const checkOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy-rent?action=check&orderId=${order.order_id}`
      );
      const data = await response.json();

      if (response.ok) {
        // Update the order in Firestore with the latest data
        const orderQuery = query(
          collection(db, "rentals"),
          where("order_id", "==", order.order_id),
          where("user_email", "==", userEmail)
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, {
            status: data.status,
            sms: data.sms || [],
          });
        }

        setMessage("Order refreshed successfully");
      } else {
        setMessage(data.error || "Failed to check order");
      }
    } catch (error) {
      setMessage("Network error checking order");
      console.error(error);
    } finally {
      setLoading(false);
      fetchOrders();
    }
  };

  // Finish order
  const finishOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy-rent?action=finish&orderId=${order.order_id}`
      );
      const data = await response.json();

      if (response.ok) {
        // Update the order in Firestore
        const orderQuery = query(
          collection(db, "rentals"),
          where("order_id", "==", order.order_id),
          where("user_email", "==", userEmail)
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, {
            status: "FINISHED",
          });
        }

        setMessage("Order marked as finished");
        fetchOrders();
        onBack();
      } else {
        setMessage(data.error || "Failed to finish order");
      }
    } catch (error) {
      setMessage("Network error finishing order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const cancelOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy-rent?action=cancel&orderId=${order.order_id}`
      );
      const data = await response.json();

      if (response.ok) {
        // Update the order in Firestore to CANCELED
        const orderQuery = query(
          collection(db, "rentals"),
          where("order_id", "==", order.order_id),
          where("user_email", "==", userEmail)
        );
        const orderSnapshot = await getDocs(orderQuery);
        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, { status: "CANCELED" });
        }

        // Get the exact amount to refund from localStorage
        const refundAmount = parseFloat(
          localStorage.getItem("lastDeduction") || "0"
        );

        // Refund the exact amount
        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", userEmail)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const depositDoc = querySnapshot.docs[0];
          const currentAmount = Number(depositDoc.data().amount) || 0;
          const newAmount = parseFloat(
            (currentAmount + refundAmount).toFixed(2)
          );
          await updateDoc(depositDoc.ref, { amount: newAmount });
          setBalance(newAmount);
        }

        setMessage(
          `Order canceled and $${refundAmount.toFixed(
            2
          )} refunded to your balance`
        );
        setTimeout(() => setMessage(""), 5000);

        fetchOrders();
        onBack();
      } else {
        setMessage(data.error || "Failed to cancel order");
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      setMessage("Network error canceling order");
      setTimeout(() => setMessage(""), 5000);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Ban number
  const banNumber = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy-rent?action=ban&orderId=${order.order_id}`
      );
      const data = await response.json();

      if (response.ok) {
        // Update the order in Firestore
        const orderQuery = query(
          collection(db, "rentals"),
          where("order_id", "==", order.order_id),
          where("user_email", "==", userEmail)
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, {
            status: "BANNED",
          });
        }

        setMessage("Number banned");
        fetchOrders();
        onBack();
      } else {
        setMessage(data.error || "Failed to ban number");
      }
    } catch (error) {
      setMessage("Network error banning number");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Order #{order.order_id}</h3>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          Back to list
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p>
            <span className="font-medium">Phone:</span> {order.phone}
          </p>
          <p>
            <span className="font-medium">Country:</span> {order.country}
          </p>
          <p>
            <span className="font-medium">Operator:</span> {order.operator}
          </p>
        </div>
        <div>
          <p>
            <span className="font-medium">Service:</span> {order.product}
          </p>
          <p>
            <span className="font-medium">Status:</span> {order.status}
          </p>
          <p>
            <span className="font-medium">Expires:</span>{" "}
            {new Date(order.expires).toLocaleString()}
          </p>
        </div>
      </div>

      {/* SMS Messages */}
      {order.sms?.length > 0 ? (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Received SMS:</h4>
          <div className="space-y-2">
            {order.sms.map((sms: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded border">
                <p>
                  <span className="font-medium">From:</span> {sms.sender}
                </p>
                <p>
                  <span className="font-medium">Time:</span>{" "}
                  {new Date(sms.date).toLocaleString()}
                </p>
                <p className="mt-2">{sms.text}</p>
                {sms.code && <p className="mt-1 font-bold">Code: {sms.code}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center text-gray-500">
          <FiInfo className="mr-2" />
          No SMS messages received yet
        </div>
      )}

      {/* Order Actions */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={checkOrder}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
        >
          Refresh
        </button>
        <button
          onClick={finishOrder}
          disabled={order.status === "FINISHED"}
          className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50"
        >
          Finish
        </button>
        <button
          onClick={cancelOrder}
          disabled={order.status === "CANCELED"}
          className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={banNumber}
          disabled={order.status === "BANNED"}
          className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 disabled:opacity-50"
        >
          Ban
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;
