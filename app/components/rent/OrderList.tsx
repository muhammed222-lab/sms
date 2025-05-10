/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  FiClock,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";

interface OrderListProps {
  orders: any[];
  loading: boolean;
  onSelectOrder: (order: any) => void;
  rubleToUSDRate: number;
  balance: number;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  loading,
  onSelectOrder,
  rubleToUSDRate,
  balance,
}) => {
  // Status icon mapping
  const statusIcons = {
    PENDING: <FiClock className="text-yellow-500" />,
    FINISHED: <FiCheckCircle className="text-green-500" />,
    CANCELED: <FiXCircle className="text-gray-500" />,
    BANNED: <FiAlertCircle className="text-red-500" />,
  };

  // Get time remaining until expiration
  const getTimeRemaining = (expires: string) => {
    const expirationDate = new Date(expires);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (expirationDate.getTime() - now.getTime()) / 1000
    );

    if (diffInSeconds <= 0) return "Expired";

    if (diffInSeconds < 60)
      return `Expires in ${diffInSeconds} sec${diffInSeconds !== 1 ? "s" : ""}`;
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Expires in ${minutes} min${minutes !== 1 ? "s" : ""}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      return `Expires in ${hours}h ${minutes}m`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    const hours = Math.floor((diffInSeconds % 86400) / 3600);
    return `Expires in ${days}d ${hours}h`;
  };

  // Format expiration date nicely
  const formatExpirationDate = (expires: string) => {
    return new Date(expires).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort orders by received date (most recent first)
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedOrders.length > 0 && (
        <div className="p-4 bg-white rounded-lg border border-gray-100">
          <p className="font-medium text-gray-700">
            Available Balance:{" "}
            <span className="text-blue-600">${Number(balance).toFixed(2)}</span>
          </p>
        </div>
      )}

      {sortedOrders.length > 0 ? (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              onClick={() => onSelectOrder(order)}
            >
              <div className="p-4 flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <FiPhone className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{order.phone}</h3>
                    <p className="text-sm text-gray-500">{order.product}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-1">
                    {statusIcons[order.status as keyof typeof statusIcons]}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.status === "PENDING"
                          ? "bg-yellow-50 text-yellow-700"
                          : order.status === "FINISHED"
                          ? "bg-green-50 text-green-700"
                          : order.status === "CANCELED"
                          ? "bg-gray-50 text-gray-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {getTimeRemaining(order.expires)}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Until: {formatExpirationDate(order.expires)}
                </div>
                <button
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOrder(order);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <AiOutlineLoading3Quarters className="animate-spin text-2xl text-gray-400" />
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <FiPhone className="text-2xl text-gray-400" />
              <p className="text-gray-500">
                You haven&apos;t rented any numbers yet
              </p>
              <p className="text-sm text-gray-400">
                Your orders will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderList;
