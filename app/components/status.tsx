"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const StatusNotification = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [, setDummy] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      console.log("Network status changed. Online:", navigator.onLine);
      if (navigator.onLine) {
        setIsOnline(true);
        setReconnecting(false);
        setShowNotification(true);
        // Hide notification after 3000ms
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        setIsOnline(false);
        setReconnecting(true);
        setShowNotification(true);
        // Trigger an extra background update after 1ms if needed
        setTimeout(() => {
          setDummy((prev) => prev + 1);
        }, 1);
      }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // Run once on mount to set the initial status
    updateStatus();

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed z-50 top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-md text-white ${
            isOnline ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {reconnecting ? (
            <span>⚠️ Connection lost. Attempting to reconnect...</span>
          ) : (
            <span>✅ Connection restored.</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusNotification;
