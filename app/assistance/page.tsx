/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  doc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  limit,
  getDocs,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { FiCopy, FiTrash2, FiMail, FiPlus, FiX, FiMenu } from "react-icons/fi";
import { MdStop, MdAttachFile } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import Header from "../components/header";
import Link from "next/link";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  conversationId?: string;
}

const ChatPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [conversations, setConversations] = useState<any[]>([]);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // System prompt for AI responses
  const systemPrompt = `You are an expert assistant for SMS Globe (smsglobe.net), a leading bulk SMS service provider.
  
  Key Information:
  - Services: Bulk SMS, SMS API, SMS Marketing
  - Features: 99% delivery rate, global coverage
  - Pricing: Starts at $0.10 per SMS (volume discounts available)
  
  Response Guidelines:
  - Be concise but helpful (1-2 short paragraphs max)
  - Maintain professional yet friendly tone
  - For technical issues, provide clear steps
  - When unsure, suggest contacting support@smsglobe.net`;

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) loadConversations(user.uid);
      else {
        setMessages([]);
        setConversations([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load conversations with optimized query
  const loadConversations = useCallback(
    async (userId: string) => {
      try {
        const q = query(
          collection(db, "conversations"),
          where("userId", "==", userId),
          orderBy("updatedAt", "desc"),
          limit(15)
        );

        return onSnapshot(q, (snapshot) => {
          const convos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          }));
          setConversations(convos);
          if (convos.length > 0 && !activeConversation) {
            setActiveConversation(convos[0].id);
          }
        });
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    },
    [activeConversation]
  );

  // Load messages with error handling
  useEffect(() => {
    if (!activeConversation) return;

    let unsubscribe: () => void;
    const loadMessages = async () => {
      try {
        const q = query(
          collection(db, "messages"),
          where("conversationId", "==", activeConversation),
          orderBy("createdAt", "asc"),
          limit(100)
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            text: doc.data().content || "",
            sender: doc.data().sender || "unknown",
            timestamp: doc.data().createdAt?.toDate() || new Date(),
            conversationId: doc.data().conversationId,
          }));
          setMessages(loadedMessages);
          scrollToBottom();
          markMessagesAsRead(activeConversation);
        });
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
    return () => unsubscribe?.();
  }, [activeConversation]);

  // Create new conversation
  const createNewConversation = async () => {
    if (!user) return null;
    try {
      const convoRef = await addDoc(collection(db, "conversations"), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split("@")[0],
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCount: 0,
        title: "New Chat",
      });
      setActiveConversation(convoRef.id);
      setShowMobileSidebar(false);
      return convoRef.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  };

  // Enhanced send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !user) return;

    try {
      setIsLoading(true);
      const conversationId =
        activeConversation || (await createNewConversation());
      if (!conversationId) return;

      // Add user message
      await addDoc(collection(db, "messages"), {
        conversationId,
        sender: user.email,
        content: inputMessage,
        createdAt: serverTimestamp(),
        read: true,
      });

      // Update conversation
      await updateDoc(doc(db, "conversations", conversationId), {
        updatedAt: serverTimestamp(),
        title: inputMessage.slice(0, 50),
      });

      setInputMessage("");
      setIsTyping(true);

      // Generate AI response
      const controller = new AbortController();
      setAbortController(controller);

      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          system_message: systemPrompt,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("API request failed");
      const { response: aiResponse } = await response.json();

      // Add AI response
      await addDoc(collection(db, "messages"), {
        conversationId,
        sender: "support@smsglobe.net",
        content: aiResponse,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        await addDoc(collection(db, "messages"), {
          conversationId: activeConversation,
          sender: "support@smsglobe.net",
          content:
            "Sorry, I'm having trouble responding. Please try again later.",
          createdAt: serverTimestamp(),
          read: false,
        });
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setAbortController(null);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        where("read", "==", false),
        where("sender", "==", "support@smsglobe.net")
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((doc) => batch.update(doc.ref, { read: true }));
      await batch.commit();

      await updateDoc(doc(db, "conversations", conversationId), {
        unreadCount: 0,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Format message text with links
  const formatMessageText = (text: any) => {
    // Ensure text is a string
    const stringText = typeof text === "string" ? text : String(text);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return stringText.split("\n").map((paragraph, i) => (
      <p key={i} className="mb-2">
        {paragraph.split(urlRegex).map((part, j) =>
          urlRegex.test(part) ? (
            <a
              key={j}
              href={part}
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />

      {/* Main Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="md:hidden fixed bottom-4 right-4 z-20 bg-blue-500 text-white p-3 rounded-full shadow-lg"
        >
          {showMobileSidebar ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Sidebar - Mobile Overlay */}
        {showMobileSidebar && (
          <div
            className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-50"
            onClick={() => setShowMobileSidebar(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-3/4 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Your Chats</h2>
                  <button
                    onClick={createNewConversation}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FiPlus />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {conversations.map((convo) => (
                    <div
                      key={convo.id}
                      onClick={() => {
                        setActiveConversation(convo.id);
                        setShowMobileSidebar(false);
                      }}
                      className={`p-3 rounded-lg cursor-pointer mb-2 ${
                        activeConversation === convo.id
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <p className="font-medium truncate">
                        {convo.title || "New Chat"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {convo.updatedAt.toLocaleDateString()} at{" "}
                        {convo.updatedAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:w-64 lg:w-72 bg-white border-r flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Chats</h2>
              <button
                onClick={createNewConversation}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FiPlus />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => setActiveConversation(convo.id)}
                className={`p-3 cursor-pointer ${
                  activeConversation === convo.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
              >
                <p className="font-medium truncate">
                  {convo.title || "New Chat"}
                </p>
                <p className="text-xs text-gray-500">
                  {convo.updatedAt.toLocaleDateString()} •{" "}
                  {convo.updatedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="mr-3 p-2 rounded-full hover:bg-gray-100 md:hidden"
              >
                <FiMenu />
              </button>
              <div>
                <h3 className="font-semibold">
                  {conversations.find((c) => c.id === activeConversation)
                    ?.title || "New Chat"}
                </h3>
                {isTyping && (
                  <p className="text-xs text-gray-500">AI is typing...</p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href="mailto:support@smsglobe.net"
                className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50"
                title="Email Support"
              >
                <FiMail />
              </Link>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <img
                    src="/favicon-16x16.png"
                    alt="SMS Globe"
                    className="w-12 h-12"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to SMS Globe Support
                </h3>
                <p className="text-gray-500 max-w-md mb-6">
                  How can we help you today? Ask about our bulk SMS services,
                  API integration, or pricing plans.
                </p>
                <button
                  onClick={createNewConversation}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full shadow-sm transition-colors"
                >
                  Start New Conversation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === user?.email
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] lg:max-w-[70%] flex ${
                        message.sender === user?.email ? "flex-row-reverse" : ""
                      }`}
                    >
                      {/* Avatar - Only shown for AI messages */}
                      {message.sender !== user?.email && (
                        <div className="flex-shrink-0 mr-3 ml-1">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <img
                              src="/favicon-16x16.png"
                              alt="AI"
                              className="w-5 h-5"
                            />
                          </div>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.sender === user?.email
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white border rounded-bl-none shadow-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {formatMessageText(message.text)}
                        </div>
                        <div
                          className={`flex items-center mt-1 ${
                            message.sender === user?.email
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <span
                            className={`text-xs ${
                              message.sender === user?.email
                                ? "text-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(message.text)
                            }
                            className={`ml-2 opacity-0 group-hover:opacity-70 hover:opacity-100 ${
                              message.sender === user?.email
                                ? "text-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            <FiCopy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] lg:max-w-[70%] flex">
                      <div className="flex-shrink-0 mr-3 ml-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <img
                            src="/favicon-16x16.png"
                            alt="AI"
                            className="w-5 h-5"
                          />
                        </div>
                      </div>
                      <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                        <div className="flex space-x-2 items-center">
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
                            onClick={() => abortController?.abort()}
                            className="text-red-500 text-sm flex items-center ml-2"
                          >
                            <MdStop className="mr-1" /> Stop
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t p-4">
            <form
              onSubmit={handleSendMessage}
              className="flex items-end space-x-2"
            >
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50"
              >
                <MdAttachFile size={20} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full border rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  rows={1}
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setInputMessage("")}
                  className={`absolute right-12 top-3 text-gray-400 hover:text-gray-600 transition-opacity ${
                    inputMessage ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <FiX size={18} />
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`p-3 rounded-full ${
                  inputMessage.trim()
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <IoSend size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
