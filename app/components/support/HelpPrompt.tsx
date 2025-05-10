// components/support/HelpPrompt.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

const HelpPrompt: React.FC<{
  position: { x: number; y: number };
  onClose: () => void;
  onSelectOption: (option: "quick" | "deep") => void;
}> = ({ position, onClose, onSelectOption }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-50 bg-white p-4 rounded-xl shadow-xl border border-gray-200 max-w-xs"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-800">Need help?</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          We noticed you might need assistance. How can we help you?
        </p>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => {
              onSelectOption("quick");
              onClose();
            }}
            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 text-left"
          >
            <strong>Quick Question</strong>
            <p className="text-xs text-blue-600">
              Get instant answers from our AI assistant
            </p>
          </button>
          <button
            onClick={() => {
              onSelectOption("deep");
              onClose();
            }}
            className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 text-left"
          >
            <strong>Detailed Support</strong>
            <p className="text-xs text-gray-600">
              Contact our support team via email
            </p>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HelpPrompt;
