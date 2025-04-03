import React, { ReactNode, useState } from "react";
import {
  FaCopy,
  FaSync,
  FaTimes,
  FaCheck,
  FaHistory,
  FaSms,
  FaTrash,
} from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";

interface ActiveOrderProps {
  order: {
    priceLocal: ReactNode;
    localCurrency: ReactNode;
    orderId: string;
    phone: string;
    operator: string;
    service: string;
    price: string;
    status: string;
    expires: string;
    sms: string | null;
    smsDetails?: {
      sender: string;
      text: string;
      date: string;
      code: string;
    };
    created_at: string;
    country: string;
    number: string;
    is_reused?: boolean;
  };
  countdown: string;
  onFetchSms: () => Promise<void>;
  onCancel: () => Promise<void>;
  onRemove?: () => void;
}

const ActiveOrder: React.FC<ActiveOrderProps> = ({
  order,
  countdown,
  onFetchSms,
  onCancel,
  onRemove,
}) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSmsDetails, setShowSmsDetails] = useState(false);

  const handleCopy = (text: string) => {
    setIsCopying(true);
    navigator.clipboard.writeText(text);
    setTimeout(() => setIsCopying(false), 1500);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await onFetchSms();
    } catch (error) {
      console.error("Error refreshing SMS:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsCanceling(true);
      await onCancel();
    } catch (error) {
      console.error("Error canceling order:", error);
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusColor = () => {
    switch (order.status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "RECEIVED":
        return "bg-green-100 text-green-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      case "BANNED":
        return "bg-purple-100 text-purple-800";
      case "FINISHED":
        return "bg-blue-100 text-blue-800";
      case "TIMEOUT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">{order.service}</h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              {order.country} • {order.operator}
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Expires in</div>
            <div
              className={`text-lg font-mono ${
                countdown === "00:00" ? "text-red-500" : "text-gray-800"
              }`}
            >
              {countdown}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{order.phone}</div>
            {order.sms && (
              <div className="mt-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">SMS Code:</span>
                  <span className="bg-blue-50 px-2 py-1 rounded mr-2">
                    {order.sms}
                  </span>
                  <button
                    onClick={() => handleCopy(order.sms!)}
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    title="Copy code"
                  >
                    {isCopying ? <FaCheck /> : <FaCopy />}
                    <span className="text-xs">Copy</span>
                  </button>
                  <button
                    onClick={() => setShowSmsDetails(!showSmsDetails)}
                    className="ml-2 text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    title="Show SMS details"
                  >
                    <FaSms />
                    <span className="text-xs">Details</span>
                  </button>
                </div>

                {showSmsDetails && order.smsDetails && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p>
                      <strong>Sender:</strong> {order.smsDetails.sender}
                    </p>
                    <p>
                      <strong>Text:</strong> {order.smsDetails.text}
                    </p>
                    <p>
                      <strong>Received:</strong>{" "}
                      {new Date(order.smsDetails.date).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {order.status !== "CANCELED" && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-full flex items-center gap-1 ${
                  isRefreshing
                    ? "bg-gray-100 text-gray-400"
                    : "bg-blue-50 text-blue-500 hover:bg-blue-100"
                }`}
                title="Refresh SMS"
              >
                <FaSync className={isRefreshing ? "animate-spin" : ""} />
                <span className="text-xs">Refresh</span>
              </button>
            )}

            {["PENDING", "RECEIVED"].includes(order.status) && (
              <button
                onClick={handleCancel}
                disabled={isCanceling}
                className={`p-2 rounded-full flex items-center gap-1 ${
                  isCanceling
                    ? "bg-gray-100 text-gray-400"
                    : "bg-red-50 text-red-500 hover:bg-red-100"
                }`}
                title="Cancel order"
              >
                <FaTimes />
                <span className="text-xs">Cancel Order</span>
              </button>
            )}

            {(order.status === "CANCELED" || order.status === "FINISHED") &&
              onRemove && (
                <button
                  onClick={onRemove}
                  className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center gap-1"
                  title="Remove order"
                >
                  <FaTrash />
                  <span className="text-xs">Remove</span>
                </button>
              )}
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 text-sm text-blue-500 hover:text-blue-700 flex items-center"
        >
          <FiHelpCircle className="mr-1" />
          {showDetails ? "Hide details" : "Show details"}
        </button>
      </div>

      {showDetails && (
        <div className="bg-gray-50 p-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Order ID</p>
              <p className="font-medium">{order.orderId}</p>
            </div>
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-medium">
                {order.priceLocal} {order.localCurrency}
                {order.localCurrency !== "USD" && (
                  <span className="text-xs text-gray-500 ml-1">
                    (≈{order.price} USD)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Expires</p>
              <p className="font-medium">
                {new Date(order.expires).toLocaleString()}
              </p>
            </div>
          </div>

          {order.is_reused && (
            <div className="mt-3 flex items-center text-sm text-purple-600">
              <FaHistory className="mr-1" />
              This number was reused from a previous order
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveOrder;
