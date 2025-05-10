/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiCopy,
  FiMail,
  FiMaximize,
  FiMinimize,
  FiX,
  FiMessageSquare,
} from "react-icons/fi";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Focus input when opening or when AI finishes responding
    if (isOpen && !isAIResponding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isAIResponding]);

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

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isOpen && !isFullPage) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-4 md:bottom-10 md:right-10 bg-blue-500 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50 flex items-center"
        aria-label="Open chat"
      >
        <div className="relative">
          <FiMessageSquare size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="ml-2 hidden md:inline">Ask</span>
      </button>
    );
  }

  const getUserAvatar = () => {
    // Implement your avatar logic here
    return "/default-avatar.png";
  };

  return (
    <div
      className={`
        ${
          isFullPage
            ? "fixed inset-0 z-50 bg-white"
            : `
          fixed bottom-0 right-0 md:bottom-20 md:right-6 
          w-full md:w-96 h-[calc(100vh-60px)] md:h-[500px] 
          shadow-xl rounded-t-lg md:rounded-lg overflow-hidden z-50 bg-white flex flex-col
        `
        }
      `}
      style={isFullPage ? {} : { maxHeight: "90vh" }}
    >
      {/* Header */}
      <div className="bg-blue-500 text-white p-3 md:p-4 flex justify-between items-center">
        <h3 className="font-semibold text-base md:text-lg">
          {activeConversation ? "SMS Globe Support" : "New Conversation"}
        </h3>
        <div className="flex space-x-2">
          {!isMobile && (
            <button
              onClick={() => setIsFullPage(!isFullPage)}
              className="p-1 text-white hover:text-blue-100 rounded-full"
              title={isFullPage ? "Minimize" : "Go Full Page"}
              aria-label={isFullPage ? "Minimize" : "Go Full Page"}
            >
              {isFullPage ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
            </button>
          )}
          <button
            onClick={() =>
              isFullPage ? setIsFullPage(false) : setIsOpen(false)
            }
            className="p-1 text-white hover:text-blue-100 rounded-full"
            title="Close"
            aria-label="Close chat"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div
        className={`flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 ${
          isFullPage ? "h-[calc(100vh-120px)]" : ""
        }`}
      >
        {filteredMessages.length === 0 && !isAIResponding && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-8">
            <img
              src="/favicon-16x16.png"
              alt="SMS Globe Logo"
              className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4"
            />
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              Welcome to SMS Globe Support
            </h3>
            <p className="text-sm md:text-base text-gray-500 max-w-md">
              How can we help you today? Ask about our bulk SMS services,
              pricing plans, or account support.
            </p>
          </div>
        )}

        <div className="space-y-3 md:space-y-4">
          {filteredMessages.map((message) => (
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
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full mt-1"
                    />
                  </div>
                )}
                <div
                  className={`rounded-lg md:rounded-xl px-3 py-2 md:px-4 md:py-3 ${
                    message.sender === user?.email
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm md:text-base">
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
                      aria-label="Copy message"
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
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full mt-1"
                  />
                </div>
                <div className="bg-white border rounded-lg md:rounded-xl px-3 py-2 md:px-4 md:py-3 rounded-bl-none">
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
                      className="text-red-500 flex items-center text-xs md:text-sm"
                    >
                      <MdStop size={16} className="mr-1" />
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

      {/* Input area */}
      <div className="bg-white border-t p-3 md:p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            disabled={isAIResponding}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isAIResponding}
            className="bg-blue-500 text-white rounded-full px-3 py-2 md:px-4 md:py-3 disabled:opacity-50 hover:bg-blue-600 transition-colors text-sm md:text-base"
            aria-label="Send message"
          >
            {isAIResponding ? "..." : "Send"}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatWidget;
