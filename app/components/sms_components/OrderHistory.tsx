/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  FaCopy,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
  FaTrash,
  FaRedo,
  FaBan,
  FaShoppingCart,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { RiRssFill } from "react-icons/ri";
import { BsPhone, BsClockHistory, BsCheckCircle } from "react-icons/bs";

export interface SmsOrder {
  id: number;
  orderId: string;
  phone: string;
  operator: string;
  product: string;
  price: string;
  status: string;
  expires: string;
  sms:
    | string
    | { sender: string; text: string; code: string; created_at: string }
    | null;
  created_at: string;
  country: string;
  number: string;
  user_email: string;
  service: string;
  priceRub: string;
  localCurrency: string;
  is_reused: boolean;
  priceLocal: string;
  originalPrice: string;
}

export interface OrderHistoryProps {
  orders: SmsOrder[];
  onRefresh: (orderId: string) => Promise<void>;
  onCancel: (orderId: string) => Promise<void>;
  onRemove: (orderId: string) => Promise<void>;
  onRebuy: (order: SmsOrder) => Promise<void>;
  onBuyNext: (order: SmsOrder) => Promise<void>;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onRefresh,
  onCancel,
  onRemove,
  onRebuy,
  onBuyNext,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );
  const ordersPerPage = 5;

  // Utility functions for flags and service icons
  const getCountryFlag = (isoCode: string) => {
    if (!isoCode) return null;
    return `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`;
  };

  const getServiceLogo = (serviceName: string) => {
    if (!serviceName) return null;
    const formattedService = serviceName.toLowerCase().replace(/\s+/g, "");
    return `https://logo.clearbit.com/${formattedService}.com`;
  };

  // Filter and search orders
  // Filter, search, and sort orders by creation date (most recent first)
  const filteredOrders = orders
    .filter(
      (order) =>
        new Date(order.expires).getTime() <= Date.now() ||
        !["PENDING", "RECEIVED"].includes(order.status)
    )
    .filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderId.toLowerCase().includes(searchLower) ||
        order.phone.toLowerCase().includes(searchLower) ||
        order.service.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower) ||
        (order.sms &&
          typeof order.sms === "object" &&
          order.sms.code &&
          order.sms.code.toLowerCase().includes(searchLower))
      );
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const copyToClipboard = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const formatDate = (dateValue: any) => {
    try {
      // Handle Firestore Timestamp or string date
      const date =
        dateValue && typeof dateValue.toDate === "function"
          ? dateValue.toDate()
          : new Date(dateValue);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "FINISHED":
        return (
          <span className={`${baseClass} bg-green-100 text-green-800`}>
            <BsCheckCircle className="mr-1" /> Completed
          </span>
        );
      case "CANCELED":
        return (
          <span className={`${baseClass} bg-red-100 text-red-800`}>
            <FaTimes className="mr-1" /> Canceled
          </span>
        );
      case "BANNED":
        return (
          <span className={`${baseClass} bg-purple-100 text-purple-800`}>
            <FaBan className="mr-1" /> Banned
          </span>
        );
      case "TIMEOUT":
        return (
          <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>
            <BsClockHistory className="mr-1" /> Timeout
          </span>
        );
      case "PENDING":
        return (
          <span className={`${baseClass} bg-blue-100 text-blue-800`}>
            <BsClockHistory className="mr-1" /> Pending
          </span>
        );
      default:
        return (
          <span className={`${baseClass} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const handleRebuy = async (order: SmsOrder) => {
    setLoadingActions((prev) => ({
      ...prev,
      [`rebuy-${order.orderId}`]: true,
    }));
    try {
      await onRebuy(order);
    } finally {
      setLoadingActions((prev) => ({
        ...prev,
        [`rebuy-${order.orderId}`]: false,
      }));
    }
  };

  const handleBuyNext = async (order: SmsOrder) => {
    setLoadingActions((prev) => ({
      ...prev,
      [`buynext-${order.orderId}`]: true,
    }));
    try {
      await onBuyNext(order);
    } finally {
      setLoadingActions((prev) => ({
        ...prev,
        [`buynext-${order.orderId}`]: false,
      }));
    }
  };

  const renderSmsContent = (order: SmsOrder) => {
    if (!order.sms) return null;

    if (typeof order.sms === "string") {
      return (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm">
            <RiRssFill className="mr-2 text-blue-500" />
            <span className="font-medium">Code:</span>
            <span className="ml-2 font-mono bg-blue-50 px-2 py-1 rounded">
              {order.sms}
            </span>
            <button
              onClick={() =>
                copyToClipboard(order.sms as string, order.orderId)
              }
              className="ml-2 text-gray-400 hover:text-gray-600"
              title="Copy Code"
            >
              {copiedOrderId === order.orderId ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaCopy />
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center">
            <span className="font-medium">Sender:</span>
            <span className="ml-2">{order.sms.sender}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium">Code:</span>
            <span className="ml-2 font-mono bg-blue-50 px-2 py-1 rounded">
              {order.sms.code}
            </span>
            <button
              onClick={() =>
                order.sms &&
                typeof order.sms === "object" &&
                order.sms.code &&
                copyToClipboard(order.sms.code, order.orderId)
              }
              className="ml-2 text-gray-400 hover:text-gray-600"
              title="Copy Code"
            >
              {copiedOrderId === order.orderId ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaCopy />
              )}
            </button>
          </div>
          <div className="flex items-center">
            <span className="font-medium">Received:</span>
            <span className="ml-2">{formatDate(order.sms.created_at)}</span>
          </div>
          <div className="md:col-span-3">
            <details className="cursor-pointer">
              <summary className="font-medium">View full message</summary>
              <p className="mt-1 p-2 bg-white rounded">{order.sms.text}</p>
            </details>
          </div>
        </div>
      </div>
    );
  };

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const canRebuy = (order: SmsOrder) => {
    // Only allow rebuy for certain statuses
    return order.status !== "PENDING";
  };

  const canBuyNext = (order: SmsOrder) => {
    // Allow buying next number for any status except PENDING
    return order.status !== "PENDING";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders by ID, phone, service or code..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FaTimes className="text-gray-400 hover:text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {currentOrders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentOrders.map((order) => (
              <div key={order.orderId} className="p-4">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleExpandOrder(order.orderId)}
                >
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(order.orderId, order.orderId);
                        }}
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
                    <div className="mt-1 flex items-center">
                      {getCountryFlag(order.country) ? (
                        <img
                          src={getCountryFlag(order.country) ?? undefined}
                          alt={order.country}
                          className="w-5 h-4 mr-2 border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span className="w-5 h-4 mr-2 flex items-center justify-center bg-gray-100 text-xs border border-gray-200">
                          {order.country
                            ? order.country.toUpperCase().substring(0, 2)
                            : "🌐"}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {order.phone}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div>{getStatusBadge(order.status)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>

                {expandedOrder === order.orderId && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="w-24 font-medium">Service:</span>
                      <span className="flex items-center">
                        {getServiceLogo(order.service) ? (
                          <img
                            src={getServiceLogo(order.service) ?? undefined}
                            alt={order.service}
                            className="w-5 h-5 mr-2 rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span className="w-5 h-5 mr-2 flex items-center justify-center bg-gray-100 rounded-sm text-xs font-medium">
                            {order.service.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="ml-2">{order.service}</span>
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-24 font-medium">Price:</span>
                      <span>
                        {order.price} {order.localCurrency}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => onRefresh(order.orderId)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        title="Refresh Status"
                      >
                        <FiRefreshCw className="mr-1" /> Refresh
                      </button>
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => onCancel(order.orderId)}
                          className="flex items-center text-sm text-red-600 hover:text-red-800"
                          title="Cancel Order"
                        >
                          <FaTimes className="mr-1" /> Cancel
                        </button>
                      )}
                      {canRebuy(order) && (
                        <button
                          onClick={() => handleRebuy(order)}
                          disabled={loadingActions[`rebuy-${order.orderId}`]}
                          className={`flex items-center text-sm ${
                            loadingActions[`rebuy-${order.orderId}`]
                              ? "text-gray-500"
                              : "text-green-600 hover:text-green-800"
                          }`}
                          title="Rebuy Same Number"
                        >
                          <FaRedo className="mr-1" />
                          {loadingActions[`rebuy-${order.orderId}`]
                            ? "Processing..."
                            : "Rebuy"}
                        </button>
                      )}
                      {canBuyNext(order) && (
                        <button
                          onClick={() => handleBuyNext(order)}
                          disabled={loadingActions[`buynext-${order.orderId}`]}
                          className={`flex items-center text-sm ${
                            loadingActions[`buynext-${order.orderId}`]
                              ? "text-gray-500"
                              : "text-purple-600 hover:text-purple-800"
                          }`}
                          title="Buy Next Available Number"
                        >
                          <FaShoppingCart className="mr-1" />
                          {loadingActions[`buynext-${order.orderId}`]
                            ? "Processing..."
                            : "Buy Next"}
                        </button>
                      )}
                      <button
                        onClick={() => onRemove(order.orderId)}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                        title="Remove Order"
                      >
                        <FaTrash className="mr-1" /> Remove
                      </button>
                    </div>

                    {/* SMS Content */}
                    {order.sms && renderSmsContent(order)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <BsPhone className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search query"
                : "Your order history will appear here"}
            </p>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderId}
                        </div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCountryFlag(order.country) ? (
                          <img
                            src={getCountryFlag(order.country) ?? undefined}
                            alt={order.country}
                            className="w-6 h-4 mr-2 border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <span
                          className={`text-sm text-gray-900 ${
                            getCountryFlag(order.country) ? "" : "hidden"
                          }`}
                        >
                          {order.country.toUpperCase()}
                        </span>
                        {!getCountryFlag(order.country) && (
                          <span className="w-6 h-4 mr-2 flex items-center justify-center bg-gray-100 text-xs border border-gray-200">
                            {order.country
                              ? order.country.toUpperCase().substring(0, 2)
                              : "🌐"}
                          </span>
                        )}
                        <span className="text-sm text-gray-900">
                          {order.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getServiceLogo(order.service) ? (
                          <img
                            src={getServiceLogo(order.service) ?? undefined}
                            alt={order.service}
                            className="w-5 h-5 mr-2 rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <span
                          className={`text-sm text-gray-900 ${
                            getServiceLogo(order.service) ? "" : "hidden"
                          }`}
                        >
                          {order.service}
                        </span>
                        {!getServiceLogo(order.service) && (
                          <span className="w-5 h-5 mr-2 flex items-center justify-center bg-gray-100 rounded-sm text-xs font-medium">
                            {order.service.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.price} {order.localCurrency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onRefresh(order.orderId)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Refresh Status"
                        >
                          <FiRefreshCw />
                        </button>
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => onCancel(order.orderId)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Order"
                          >
                            <FaTimes />
                          </button>
                        )}
                        {canRebuy(order) && (
                          <button
                            onClick={() => handleRebuy(order)}
                            disabled={loadingActions[`rebuy-${order.orderId}`]}
                            className={`${
                              loadingActions[`rebuy-${order.orderId}`]
                                ? "text-gray-400"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            title="Rebuy Same Number"
                          >
                            <FaRedo />
                          </button>
                        )}
                        {canBuyNext(order) && (
                          <button
                            onClick={() => handleBuyNext(order)}
                            disabled={
                              loadingActions[`buynext-${order.orderId}`]
                            }
                            className={`${
                              loadingActions[`buynext-${order.orderId}`]
                                ? "text-gray-400"
                                : "text-purple-600 hover:text-purple-900"
                            }`}
                            title="Buy Next Available Number"
                          >
                            <FaShoppingCart />
                          </button>
                        )}
                        <button
                          onClick={() => onRemove(order.orderId)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Remove Order"
                        >
                          <FaTrash />
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
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                    <BsPhone className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No orders found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? "Try adjusting your search query"
                      : "Your order history will appear here"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
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
                  {Math.min(indexOfLastOrder, filteredOrders.length)}
                </span>{" "}
                of <span className="font-medium">{filteredOrders.length}</span>{" "}
                orders
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md -space-x-px"
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
