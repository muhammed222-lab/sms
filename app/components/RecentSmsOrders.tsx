import React from "react";
import { FaClipboard } from "react-icons/fa"; // For clipboard icon

interface SmsOrder {
  orderId: string;
  number: string;
  code: string;
  country: string;
  service: string;
  applicationId: string;
  status: string;
  action: string;
  price: number; // Added price field
  user_email: string; // Added user_email field
}

interface RecentSmsOrdersProps {
  orders: SmsOrder[]; // Currently active orders
  previouslyGeneratedOrders: SmsOrder[]; // Previously generated orders
  rejectNumber: (orderId: string, requestId: string) => Promise<void>;
  fetchSmsCode: (requestId: string, index: number) => void;
  handleCopy: (text: string) => void;
}

const RecentSmsOrders: React.FC<RecentSmsOrdersProps> = ({
  orders,
  previouslyGeneratedOrders,
  rejectNumber,
  fetchSmsCode,
  handleCopy,
}) => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm mt-5">
      <h2 className="text-xl font-bold mb-4">Recent SMS Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse border border-gray-300">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border border-gray-300 p-3">Order ID</th>
              <th className="border border-gray-300 p-3">Number</th>
              <th className="border border-gray-300 p-3">Service</th>
              <th className="border border-gray-300 p-3">Country</th>
              <th className="border border-gray-300 p-3">Status</th>
              <th className="border border-gray-300 p-3">Code</th>
              <th className="border border-gray-300 p-3">Price</th>
              <th className="border border-gray-300 p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No results.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">
                    {order.orderId}
                  </td>
                  <td className="border border-gray-300 p-3 flex items-center">
                    {order.number}
                    <FaClipboard
                      className="ml-2 cursor-pointer"
                      onClick={() => handleCopy(order.number)}
                    />
                  </td>
                  <td className="border border-gray-300 p-3">
                    {order.service}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {order.country}
                  </td>
                  <td className="border border-gray-300 p-3">{order.status}</td>
                  <td className="border border-gray-300 p-3 flex items-center">
                    {order.code || "Pending"}
                    <FaClipboard
                      className="ml-2 cursor-pointer"
                      onClick={() => handleCopy(order.code)}
                    />
                  </td>
                  <td className="border border-gray-300 p-3">
                    {order.price ? `${order.price} NGN` : "Pending"}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {order.status === "Pending" && (
                      <button
                        onClick={() =>
                          rejectNumber(order.orderId, order.orderId)
                        }
                        className="bg-red-500 text-white p-2 rounded-lg"
                      >
                        Reject
                      </button>
                    )}
                    {order.status === "Pending" && (
                      <button
                        onClick={() => fetchSmsCode(order.orderId, index)}
                        className="bg-blue-500 text-white p-2 rounded-lg ml-2"
                      >
                        Get Code
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Previously Generated Numbers Section */}
      <h2 className="text-xl font-bold mb-4 mt-8">
        Previously Generated Numbers
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse border border-gray-300">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border border-gray-300 p-3">Order ID</th>
              <th className="border border-gray-300 p-3">Number</th>
              <th className="border border-gray-300 p-3">Service</th>
              <th className="border border-gray-300 p-3">Country</th>
              <th className="border border-gray-300 p-3">Status</th>
              <th className="border border-gray-300 p-3">Code</th>
              <th className="border border-gray-300 p-3">Price</th>
            </tr>
          </thead>
          <tbody>
            {previouslyGeneratedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No previous results.
                </td>
              </tr>
            ) : (
              previouslyGeneratedOrders.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">
                    {order.orderId}
                  </td>
                  <td className="border border-gray-300 p-3 flex items-center">
                    {order.number}
                    <FaClipboard
                      className="ml-2 cursor-pointer"
                      onClick={() => handleCopy(order.number)}
                    />
                  </td>
                  <td className="border border-gray-300 p-3">
                    {order.service}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {order.country}
                  </td>
                  <td className="border border-gray-300 p-3">{order.status}</td>
                  <td className="border border-gray-300 p-3 flex items-center">
                    {order.code || "Pending"}
                    <FaClipboard
                      className="ml-2 cursor-pointer"
                      onClick={() => handleCopy(order.code)}
                    />
                  </td>
                  <td className="border border-gray-300 p-3">
                    {order.price ? `${order.price} NGN` : "Pending"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSmsOrders;
