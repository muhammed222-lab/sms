/* eslint-disable @typescript-eslint/no-explicit-any */
// components/rent/ActiveOrders.tsx
import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ActiveOrdersProps {
  activeOrders: any[];
  onCancelOrder: (orderId: string) => void;
  loading?: boolean;
}

const ActiveOrders: React.FC<ActiveOrdersProps> = ({
  activeOrders,
  onCancelOrder,
  loading,
}) => {
  if (!activeOrders.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4">Active Rentals</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        {loading ? (
          <div className="flex justify-center py-4">
            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
          </div>
        ) : (
          activeOrders.map((order) => (
            <div
              key={order.id}
              className="mb-4 last:mb-0 border-b pb-4 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.phone}</p>
                  <p className="text-sm text-gray-600">
                    {order.product} • Expires:{" "}
                    {new Date(order.expires).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => onCancelOrder(order.order_id)}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveOrders;
