/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode, useState } from "react";
import {
  FaCopy,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

// Update the SmsOrder interface so that sms is typed correctly.
export interface SmsOrderBase {
  id: number;
  orderId: string;
  phone: string;
  operator: string;
  product: string;
  price: string;
  status: string;
  expires: string;
  created_at: any;
  country: string;
  number: string;
  user_email: string;
  service: string;
  is_reused?: boolean;
}

export interface SmsOrder {
  localCurrency: ReactNode;
  id: number;
  orderId: string;
  phone: string;
  operator: string;
  product: string;
  price: string;
  status: string;
  expires: string;
  sms:
    | {
        created_at: any;
        date: any;
        sender: string;
        text: string;
        code: string;
      }
    | string
    | null; // allow sms to be a string
  created_at: any;
  country: string;
  number: string;
  user_email: string;
  service: string;
  is_reused?: boolean;
  priceLocal?: string;
}

export interface OrderHistoryProps {
  orders: SmsOrder[];
  onRefresh: (orderId: string) => Promise<void>;
  onCancel: (orderId: string) => Promise<void>;
  onRemove: (orderId: string) => Promise<void>;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onRefresh,
  onCancel,
  onRemove,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const ordersPerPage = 5;

  // Filter out active orders so that we only show history orders.
  const historyOrders = orders.filter(
    (order) =>
      new Date(order.expires).getTime() <= Date.now() ||
      !["PENDING", "RECEIVED"].includes(order.status)
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = historyOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(historyOrders.length / ordersPerPage);

  const copyToClipboard = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const formatDate = (dateValue: any) => {
    // If dateValue has a toDate function, assume it's a Firestore Timestamp
    const date =
      dateValue && typeof dateValue.toDate === "function"
        ? dateValue.toDate()
        : new Date(dateValue);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FINISHED":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Completed
          </span>
        );
      case "CANCELED":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Canceled
          </span>
        );
      case "BANNED":
        return (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Banned
          </span>
        );
      case "TIMEOUT":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Timeout
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  const renderSmsContent = (order: SmsOrder) => {
    if (!order.sms) return null;
    // When sms is a string, simply display it.
    if (typeof order.sms === "string") {
      return (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
          <p>Code: {order.sms}</p>
        </div>
      );
    }
    // When sms is an object, safely convert each field to a string.
    const safeString = (value: any) =>
      typeof value === "string" ? value : JSON.stringify(value);
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
        <p>Sender: {safeString(order.sms.sender)}</p>
        <p>Text: {safeString(order.sms.text)}</p>
        <p>Code: {safeString(order.sms.code)}</p>
        <p className="text-gray-500 text-xs">
          {formatDate(order.sms.created_at)}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <React.Fragment key={order.orderId}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        #{order.orderId}
                        <button
                          onClick={() =>
                            copyToClipboard(order.orderId, order.orderId)
                          }
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy Order ID"
                        >
                          {copiedOrderId === order.orderId ? (
                            <FaCheck className="text-green-500" />
                          ) : (
                            <FaCopy />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.price} {order.localCurrency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => onCancel(order.orderId)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Order"
                          >
                            <FaTimes />
                          </button>
                        )}
                        <button
                          onClick={() => onRefresh(order.orderId)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Refresh Status"
                        >
                          <FiRefreshCw />
                        </button>
                        <button
                          onClick={() => onRemove(order.orderId)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Remove Order"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {order.sms && (
                    <tr>
                      <td colSpan={7} className="px-6 py-2">
                        {renderSmsContent(order)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No order history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstOrder + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastOrder, historyOrders.length)}
                </span>{" "}
                of <span className="font-medium">{historyOrders.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <FaArrowLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <FaArrowRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
