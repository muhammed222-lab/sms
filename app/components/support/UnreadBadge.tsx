// components/support/UnreadBadge.tsx
import React from "react";
import { motion } from "framer-motion";

const UnreadBadge: React.FC<{ count: number }> = ({ count }) => {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
    >
      {count > 9 ? "9+" : count}
    </motion.span>
  );
};

export default UnreadBadge;
