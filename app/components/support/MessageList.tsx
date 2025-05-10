// components/support/MessageList.tsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaUser, FaHeadset } from "react-icons/fa";
import { Message, Conversation } from "./types";

const MessageList: React.FC<{
  messages: Message[];
  activeTab: "quick" | "deep";
  activeConversation: Conversation | null;
}> = ({ messages, activeTab, activeConversation }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeConversation && messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
        <div className="text-4xl mb-4">
          {activeTab === "quick" ? <FaRobot /> : <FaHeadset />}
        </div>
        <h3 className="font-medium text-lg mb-2">
          {activeTab === "quick" ? "Ask me anything!" : "How can we help you?"}
        </h3>
        <p className="text-sm">
          {activeTab === "quick"
            ? "I can answer your questions instantly"
            : "Our team will get back to you soon"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex ${
            message.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-xs md:max-w-md rounded-xl px-4 py-3 ${
              message.sender === "user"
                ? "bg-blue-500 text-white rounded-br-none"
                : message.sender === "ai"
                ? "bg-gray-100 text-gray-800 rounded-bl-none"
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            }`}
          >
            <div className="flex items-center mb-1">
              {message.sender === "ai" ? (
                <FaRobot className="mr-2 text-blue-500" />
              ) : message.sender === "support" ? (
                <FaHeadset className="mr-2 text-gray-500" />
              ) : (
                <FaUser className="mr-2 text-blue-300" />
              )}
              <span className="text-xs font-medium">
                {message.sender === "user"
                  ? "You"
                  : message.sender === "ai"
                  ? "AI Assistant"
                  : "Support Agent"}
              </span>
            </div>
            <p className="text-sm">{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-blue-400 hover:underline truncate"
                  >
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
