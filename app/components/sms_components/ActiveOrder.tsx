/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect } from "react";
import { FiCopy } from "react-icons/fi";
import { MdCancel, MdRefresh, MdCheck } from "react-icons/md";
import { FaSave, FaTrash } from "react-icons/fa";
import FailedNotification from "./FailedNotification"; // import the new notification
import SuccessNotification from "./SuccessNotification"; // ensure this exists

interface Order {
  id: number;
  orderId: string;
  service: string;
  country: string;
  number: string;
  price: string;
  sms: string | null;
  created_at?: string; // Order creation time
  status?: string;
  user_email?: string;
  is_reused?: boolean; // Indicates if the order is reused
}

interface ActiveOrderProps {
  order: Order;
  onCopy?: (text: string) => void;
  countdown: string;
  onFetchSms: () => Promise<void>;
  // Callback: second parameter (smsCode) is optional.
  onRefreshSms?: (orderId: string, smsCode?: string | null) => void;
  onCancel: (orderId: string) => Promise<void>; // Parent should update DB on success.
  onFavorite?: (orderId: string) => void;
}

const ActiveOrder: React.FC<ActiveOrderProps> = ({
  order,
  onCopy,
  onRefreshSms,
  onCancel,
  onFavorite,
}) => {
  // Local state for UI behavior.
  const [countdown, setCountdown] = useState("30:00");
  const [smsLoading, setSmsLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [canceled, setCanceled] = useState(false);
  const [expired, setExpired] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

  // Instead of returning null when removed,
  // we return an empty container so hooks are always run.
  if (removed) {
    return <div style={{ display: "none" }} />;
  }

  // Countdown and expiration effect.
  // Inside the countdown effect, update the expiration handling:
  useEffect(() => {
    if (!order.created_at) {
      throw new Error("Order creation date is missing");
    }
    const orderCreatedAt = new Date(order.created_at).getTime();
    const expiresAt = orderCreatedAt + 30 * 60 * 1000; // 30 minutes later
    const updateCountdown = async () => {
      const now = Date.now();
      const diff = expiresAt - now;
      if (diff <= 0) {
        setCountdown("00:00");
        if (!expired && !canceled) {
          setExpired(true);
          // Update order status to "Expired" in your database.
          try {
            await fetch(`/api/getsms/update-status?id=${order.orderId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: "Expired",
                user_email: order.user_email || "",
              }),
            });
          } catch (error) {
            console.error("Error updating status to Expired", error);
          }
        }
      } else {
        const minutes = Math.floor(diff / 60000)
          .toString()
          .padStart(2, "0");
        const seconds = Math.floor((diff % 60000) / 1000)
          .toString()
          .padStart(2, "0");
        setCountdown(`${minutes}:${seconds}`);
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [order.created_at, expired, canceled, order.orderId, order.user_email]);

  // ... (handleRefreshSms remains unchanged)

  // In handleCancelOrder, after successful cancellation, update the DB status:

  // In the render section, update the expired label to use yellow text:
  {
    /* ... Order info display ... */
  }
  {
    canceled && (
      <div className="flex items-center gap-1 text-red-600">
        <MdCancel size={18} />
        <span className="font-semibold">Canceled</span>
      </div>
    );
  }
  {
    expired && !canceled && (
      <div className="flex items-center gap-1 text-yellow-600">
        <MdCancel size={18} />
        <span className="font-semibold">Expired</span>
      </div>
    );
  }

  // And in the action buttons area, we already check:
  // if (canceled || expired) then show Rebuy Number and Remove buttons,
  // otherwise show "Cancel order" button.
  // (No further change is needed here.)

  const handleRefreshSms = async () => {
    setSmsLoading(true);
    try {
      const response = await fetch(
        `/api/getsms/check-order?id=${order.orderId}`
      );
      const data = await response.json();
      if (data.sms && data.sms.length > 0) {
        const smsCode = data.sms[0].code;
        onRefreshSms && onRefreshSms(order.orderId, smsCode);
      } else {
        const promptMessage = `We will let you know once SMS CODE is sent to ${order.number} (${order.country}).`;
        setSuccessMsg(promptMessage);
        onRefreshSms && onRefreshSms(order.orderId, null);
      }
    } catch (error) {
      console.error("Error refreshing SMS", error);
    } finally {
      setSmsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelError("");
    setCanceling(true);
    try {
      // Verify order exists.
      const checkResponse = await fetch(
        `/api/getsms/check-order?id=${order.orderId}`
      );
      const checkData = await checkResponse.json();
      if (!checkResponse.ok || !checkData.id) {
        throw new Error("Order verification failed");
      }
      // Attempt cancellation.
      const cancelResponse = await fetch(
        `/api/getsms/cancel-order?id=${order.orderId}`
      );
      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json();
        if (cancelResponse.status === 404) {
          throw new Error(
            "We can't find this order (already been canceled or expired). It may still appear in your dashboard."
          );
        }
        throw new Error(errorData.error || "Cancellation failed");
      }
      const result = await cancelResponse.json();
      if (result.status !== "CANCELED") {
        throw new Error("Order status not updated");
      }
      setCanceled(true);
      setSuccessMsg(
        "Your order is canceled. The money will be returned to the balance automatically within 15 minutes."
      );
      // Update DB status to Canceled.
      try {
        await fetch(`/api/getsms/update-status?id=${order.orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Canceled",
            user_email: order.user_email || "",
          }),
        });
      } catch (error) {
        console.error("Error updating status to Canceled", error);
      }
      // Update the order's status in localStorage so that a refresh reflects the canceled state.
      const storedOrders = localStorage.getItem("smsOrders");
      if (storedOrders) {
        let orders = JSON.parse(storedOrders);
        orders = orders.map((ord: Order) =>
          ord.orderId === order.orderId ? { ...ord, status: "Canceled" } : ord
        );
        localStorage.setItem("smsOrders", JSON.stringify(orders));
      }
      onCancel?.(order.orderId);
    } catch (error) {
      console.error("Cancel error:", error);
      setCancelError(
        error instanceof Error ? error.message : "Failed to cancel order"
      );
    } finally {
      setCanceling(false);
    }
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.number);
      onCopy && onCopy(order.number);
      setCopiedNumber(true);
      setSuccessMsg("Number copied!");
      setTimeout(() => {
        setCopiedNumber(false);
        setSuccessMsg("");
      }, 2000);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  };

  const handleCopySms = async () => {
    if (order.sms) {
      try {
        await navigator.clipboard.writeText(order.sms);
        onCopy && onCopy(order.sms);
        setCopiedSms(true);
        setSuccessMsg("SMS copied!");
        setTimeout(() => {
          setCopiedSms(false);
          setSuccessMsg("");
        }, 2000);
      } catch (error) {
        console.error("Clipboard copy failed", error);
      }
    }
  };

  const handleRemove = () => {
    setRemoved(true);
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
          <strong>Price:</strong> {order.price} USD
        </span>
        <span className="text-gray-500">
          <strong>Expires in:</strong> {countdown}
        </span>
        <span className="text-gray-500">
          <strong>Purchased at:</strong>{" "}
          {order.created_at
            ? new Date(order.created_at).toLocaleString()
            : "N/A"}
        </span>
        {canceled && (
          <div className="flex items-center gap-1 text-red-600">
            <MdCancel size={18} />
            <span className="font-semibold">Canceled</span>
          </div>
        )}
        {expired && !canceled && (
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
              <strong>SMS:</strong> {order.sms ? order.sms : "Pending"}
            </span>
            {order.sms ? (
              <button onClick={handleCopySms} className="flex items-center">
                {copiedSms ? (
                  <MdCheck className="text-green-500" size={20} />
                ) : (
                  <FiCopy className="text-blue-500" size={20} />
                )}
              </button>
            ) : (
              order.sms === null && (
                <button
                  onClick={handleRefreshSms}
                  disabled={smsLoading}
                  className="flex items-center"
                >
                  <MdRefresh
                    className={`text-blue-500 ${
                      smsLoading ? "animate-spin" : ""
                    }`}
                    size={20}
                  />
                </button>
              )
            )}
          </div>
          {order.sms === null && (
            <div className="text-xs text-gray-500">
              SMS will drop here instantly when received or click refresh.
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canceled || expired ? (
            <>
              <button
                onClick={() => onFavorite && onFavorite(order.orderId)}
                className="px-3 py-2 bg-green-500 text-white rounded-md flex items-center gap-1 hover:bg-green-600"
              >
                <FaSave size={18} /> Rebuy Number
              </button>
              <button
                onClick={handleRemove}
                className="px-3 py-2 bg-gray-200 text-red-600 rounded-md flex items-center gap-1 hover:bg-gray-300"
              >
                <FaTrash size={18} /> Remove
              </button>
            </>
          ) : (
            <button
              onClick={handleCancelOrder}
              disabled={order.sms !== null || canceling}
              className={`px-3 py-2 bg-red-500 text-white rounded-md flex items-center gap-1 hover:bg-red-600 ${
                order.sms !== null || canceling
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <MdCancel size={18} />{" "}
              {canceling ? "Canceling order..." : "Cancel order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveOrder;
