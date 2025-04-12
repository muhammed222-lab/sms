/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/rent/OrderList.tsx
import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
  return (
    <>
      {orders.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium">
            Available Balance: $ {Number(balance).toFixed(2)}
          </p>
        </div>
      )}

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Phone</th>
                <th className="py-2 px-4 border">Service</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border text-center">
                    {order.phone}
                  </td>
                  <td className="py-2 px-4 border text-center">
                    {order.product}
                  </td>
                  <td className="py-2 px-4 border text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "FINISHED"
                          ? "bg-green-100 text-green-800"
                          : order.status === "CANCELED"
                          ? "bg-gray-100 text-gray-800"
                          : order.status === "BANNED"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border text-center">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {loading ? (
            <div className="flex justify-center">
              <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
            </div>
          ) : (
            "You haven't rented any numbers yet"
          )}
        </div>
      )}
    </>
  );
};

export default OrderList;
