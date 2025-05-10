/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiCopy, FiMail, FiMaximize, FiMinimize, FiX } from "react-icons/fi";
import { MdStop } from "react-icons/md";
import Link from "next/link";

interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  createdAt: Date;
  read: boolean;
  type: "user" | "ai";
}

interface Conversation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatWidgetProps {
  user: any;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  unreadCount: number;
  activeConversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isAIResponding: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  user,
  isOpen,
  setIsOpen,
  unreadCount,
  activeConversation,
  messages,
  onSendMessage,
  isAIResponding,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isFullPage, setIsFullPage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAIResponding) return;

    const messageContent = inputMessage;
    setInputMessage("");
    await onSendMessage(messageContent);
  };

  const formatMessageText = (text: any) => {
    if (!text) return "";

    // Ensure value is a string
    const stringText = typeof text === "string" ? text : String(text);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return stringText.split("\n").map((paragraph, i) => (
      <p key={i} className="mb-2">
        {paragraph.split(urlRegex).map((part, j) =>
          urlRegex.test(part) ? (
            <a
              key={j}
              href={part.startsWith("http") ? part : `https://${part}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </p>
    ));
  };
  const filteredMessages = React.useMemo(() => {
    if (!activeConversation) return [];

    return messages
      .filter(
        (msg) =>
          msg.conversationId === activeConversation.id &&
          (msg.sender === user?.email ||
            msg.sender === "ai" ||
            msg.sender === "AI Assistant")
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [messages, activeConversation, user?.email]);

  if (!isOpen && !isFullPage) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center fixed bottom-60 right-10 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="ml-2">Smsglobe AI</p>
      </button>
    );
  }

  function getUserAvatar(): string | undefined {
    throw new Error("Function not implemented.");
  }

  return (
    <div
      className={`${
        isFullPage
          ? "fixed inset-0 z-50 bg-white"
          : "fixed bottom-72 right-6 w-full max-w-md h-[calc(100vh-150px)] max-h-[600px] shadow-xl rounded-lg overflow-hidden z-50 bg-white flex flex-col"
      }`}
    >
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          {activeConversation ? "Support Chat" : "New Conversation"}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsFullPage(!isFullPage)}
            className="p-1 text-white hover:text-blue-100 rounded-full"
            title={isFullPage ? "Minimize" : "Go Full Page"}
          >
            {isFullPage ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
          </button>
          <button
            onClick={() =>
              isFullPage ? setIsFullPage(false) : setIsOpen(false)
            }
            className="p-1 text-white hover:text-blue-100 rounded-full"
            title="Close"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto p-4 bg-gray-50 ${
          isFullPage ? "h-[calc(100vh-120px)]" : ""
        }`}
      >
        {filteredMessages.length === 0 && !isAIResponding && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <img
              src="/favicon-16x16.png"
              alt="SMS Globe Logo"
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to SMS Globe Support
            </h3>
            <p className="text-gray-500 max-w-md">
              How can we help you today? Ask about our bulk SMS services, API
              integration, or pricing plans.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === user?.email ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex max-w-[90%]">
                {message.sender !== user?.email && (
                  <div className="flex-shrink-0 mr-2">
                    <img
                      src={
                        message.sender === "ai"
                          ? "/favicon-16x16.png"
                          : getUserAvatar()
                      }
                      alt="Avatar"
                      className="w-8 h-8 rounded-full mt-1"
                    />
                  </div>
                )}
                <div
                  className={`rounded-xl px-4 py-3 ${
                    message.sender === user?.email
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {formatMessageText(message.content)}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span
                      className={`text-xs ${
                        message.sender === user?.email
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {message.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(message.content)
                      }
                      className={`opacity-0 group-hover:opacity-70 hover:opacity-100 ml-2 ${
                        message.sender === user?.email
                          ? "text-blue-100 hover:text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      title="Copy message"
                    >
                      <FiCopy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isAIResponding && (
            <div className="flex justify-start">
              <div className="flex max-w-[90%]">
                <div className="flex-shrink-0 mr-2">
                  <img
                    src="/favicon-16x16.png"
                    alt="AI Avatar"
                    className="w-8 h-8 rounded-full mt-1"
                  />
                </div>
                <div className="bg-white border rounded-xl px-4 py-3 rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                    <button
                      onClick={() => {}}
                      className="text-red-500 flex items-center text-sm"
                    >
                      <MdStop size={18} className="mr-1" />
                      Stop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAIResponding}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isAIResponding}
            className="bg-blue-500 text-white rounded-full px-4 py-3 disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            {isAIResponding ? "Sending..." : "Send"}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send and Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatWidget;
