/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { FiCopy } from "react-icons/fi";
import { MdCancel, MdRefresh, MdCheck, MdDone } from "react-icons/md";
import { FaSave, FaTrash } from "react-icons/fa";
import FailedNotification from "./FailedNotification";
import SuccessNotification from "./SuccessNotification";
import { SmsOrder } from "./OrderHistory";

interface ActiveOrderProps {
  order: SmsOrder;
  countdown: string;
  onFetchSms: () => Promise<void>;
  onCancel: (orderId: string) => Promise<void>;
  onRemove: (orderId: string) => Promise<void>;
  onRebuy: (order: SmsOrder) => Promise<void>;
  onCopy?: (text: string) => void;
}

const ActiveOrder: React.FC<ActiveOrderProps> = ({
  order,
  countdown,
  onFetchSms,
  onCancel,
  onRemove,
  onRebuy,
  onCopy,
}) => {
  // Local state for UI behavior
  const [smsLoading, setSmsLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [rebuying, setRebuying] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

  // Determine order status
  const isCanceled = order.status === "CANCELED";
  const isExpired = new Date(order.expires).getTime() <= Date.now();
  const isActive = !isCanceled && !isExpired;
  const hasSms = !!order.sms;

  const handleRefreshSms = async () => {
    setSmsLoading(true);
    try {
      await onFetchSms();
      setSuccessMsg("Refreshing SMS...");
    } catch (error) {
      console.error("Error refreshing SMS", error);
      setCancelError("Failed to refresh SMS. Please try again.");
    } finally {
      setSmsLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    setCompleting(true);
    try {
      // You might want to update order status to "COMPLETED" here
      setSuccessMsg("Order marked as completed.");
      setTimeout(() => {
        handleRemoveOrder();
      }, 1500); // Give user time to see the completion message
    } catch (error) {
      console.error("Complete error:", error);
      setCancelError(
        error instanceof Error ? error.message : "Failed to complete order"
      );
    } finally {
      setCompleting(false);
    }
  };

  const handleRemoveOrder = async () => {
    setRemoving(true);
    try {
      await onRemove(order.orderId);
      setSuccessMsg("Order removed successfully.");
    } catch (error) {
      console.error("Remove error:", error);
      setCancelError(
        error instanceof Error ? error.message : "Failed to remove order"
      );
    } finally {
      setRemoving(false);
    }
  };

  const handleRebuyNumber = async () => {
    setRebuying(true);
    try {
      await onRebuy(order);
      setSuccessMsg("Number successfully re-bought.");
    } catch (error) {
      console.error("Rebuy error:", error);
      setCancelError(
        error instanceof Error ? error.message : "Failed to rebuy number"
      );
    } finally {
      setRebuying(false);
    }
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.number);
      onCopy && onCopy(order.number);
      setCopiedNumber(true);
      setSuccessMsg("Number copied!");
      setTimeout(() => setCopiedNumber(false), 2000);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  };

  const handleCopySms = async () => {
    if (order.sms) {
      try {
        const smsText =
          typeof order.sms === "string" ? order.sms : order.sms?.text;
        if (smsText) {
          await navigator.clipboard.writeText(smsText);
        }
        onCopy && onCopy(smsText || "");
        setCopiedSms(true);
        setSuccessMsg("SMS copied!");
        setTimeout(() => setCopiedSms(false), 2000);
      } catch (error) {
        console.error("Clipboard copy failed", error);
      }
    }
  };

  // Auto-refresh SMS when it's not received yet
  useEffect(() => {
    if (isActive && !order.sms) {
      const interval = setInterval(() => {
        handleRefreshSms();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isActive, order.sms]);

  const handleCancelOrder = async () => {
    setCancelError("");
    setCanceling(true);
    try {
      await onCancel(order.orderId);
      setSuccessMsg("Order canceled successfully.");
    } catch (error) {
      console.error("Cancel error:", error);
      setCancelError(
        error instanceof Error ? error.message : "Failed to cancel order"
      );
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b">
      {cancelError && (
        <FailedNotification
          message={cancelError}
          onClose={() => setCancelError("")}
        />
      )}
      {successMsg && (
        <SuccessNotification
          message={successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}

      <div className="flex flex-col gap-1">
        <span className="text-gray-600">
          <strong>Order #:</strong> {order.id}
        </span>
        <span className="text-blue-500 font-medium">
          <strong>Service:</strong> {order.service}
        </span>
        <span className="text-gray-500">
          <strong>Country:</strong> {order.country}
        </span>
        <span className="text-gray-500">
          <strong>Price:</strong> {order.priceLocal}{" "}
          {order.localCurrency || "NGN"}
        </span>
        {isActive && (
          <span className="text-gray-500">
            <strong>Expires in:</strong> {countdown}
          </span>
        )}
        <span className="text-gray-500">
          <strong>Purchased at:</strong>{" "}
          {new Date(order.created_at).toLocaleString()}
        </span>
        {isCanceled && (
          <div className="flex items-center gap-1 text-red-600">
            <MdCancel size={18} />
            <span className="font-semibold">Canceled</span>
          </div>
        )}
        {isExpired && !isCanceled && (
          <div className="flex items-center gap-1 text-orange-600">
            <MdCancel size={18} />
            <span className="font-semibold">Expired</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleCopyNumber}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-md"
        >
          {copiedNumber ? (
            <MdCheck className="text-green-500" />
          ) : (
            <FiCopy className="text-blue-500" />
          )}
          {order.number}
        </button>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">
              <strong>SMS:</strong>{" "}
              {typeof order.sms === "string"
                ? order.sms
                : order.sms?.text || "Pending"}
            </span>
            {/* Always show refresh button if order is active */}
            {isActive && (
              <button
                onClick={handleRefreshSms}
                disabled={smsLoading}
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                title="Refresh SMS"
              >
                <MdRefresh
                  className={`${smsLoading ? "animate-spin" : ""}`}
                  size={20}
                />
                <span className="text-xs">Refresh</span>
              </button>
            )}
            {/* Show copy button only if SMS exists */}
            {order.sms && (
              <button onClick={handleCopySms} className="flex items-center">
                {copiedSms ? (
                  <MdCheck className="text-green-500" size={20} />
                ) : (
                  <FiCopy className="text-blue-500" size={20} />
                )}
              </button>
            )}
          </div>
          {!order.sms && isActive && (
            <div className="text-xs text-gray-500">
              SMS will appear here when received
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isCanceled || isExpired ? (
            <>
              <button
                onClick={handleRebuyNumber}
                disabled={rebuying}
                className={`px-3 py-2 bg-green-500 text-white rounded-md flex items-center gap-1 hover:bg-green-600 ${
                  rebuying ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaSave size={18} />
                {rebuying ? "Processing..." : "Rebuy Number"}
              </button>
              <button
                onClick={handleRemoveOrder}
                disabled={removing}
                className={`px-3 py-2 bg-gray-200 text-red-600 rounded-md flex items-center gap-1 hover:bg-gray-300 ${
                  removing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaTrash size={18} />
                {removing ? "Removing..." : "Remove"}
              </button>
            </>
          ) : hasSms ? (
            <>
              <button
                onClick={handleCompleteOrder}
                disabled={completing}
                className={`px-3 py-2 bg-green-500 text-white rounded-md flex items-center gap-1 hover:bg-green-600 ${
                  completing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <MdDone size={18} />
                {completing ? "Completing..." : "Complete"}
              </button>
              <button
                onClick={handleRemoveOrder}
                disabled={removing}
                className={`px-3 py-2 bg-gray-200 text-red-600 rounded-md flex items-center gap-1 hover:bg-gray-300 ${
                  removing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaTrash size={18} />
                {removing ? "Removing..." : "Remove"}
              </button>
            </>
          ) : (
            <button
              onClick={handleCancelOrder}
              disabled={canceling}
              className={`px-3 py-2 bg-red-500 text-white rounded-md flex items-center gap-1 hover:bg-red-600 ${
                canceling ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <MdCancel size={18} />
              {canceling ? "Canceling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveOrder;
