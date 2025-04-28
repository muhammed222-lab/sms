/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { FiRefreshCw, FiCopy, FiMail, FiClock, FiPlus } from "react-icons/fi";

const TempMail = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tempEmails, setTempEmails] = useState<
    { email: string; createdAt: { seconds: number } }[]
  >([]);
  const [activeEmail, setActiveEmail] = useState("");
  const [inbox, setInbox] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");
  const [copied, setCopied] = useState(false);

  // Generate random ID (4 chars)
  const generateRandomId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  // Get logged-in user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user data
  const fetchUserData = (userId: string) => {
    const tempEmailQuery = query(
      collection(db, "tempEmails"),
      where("userId", "==", userId),
      where("isActive", "==", true)
    );

    const inboxQuery = query(
      collection(db, "inbox"),
      where("userId", "==", userId)
    );

    onSnapshot(tempEmailQuery, (snapshot) => {
      const emails = snapshot.docs.map((doc) => ({
        email: doc.data().email,
        createdAt: doc.data().createdAt,
      }));
      setTempEmails(emails);
      if (emails.length > 0 && !activeEmail) {
        setActiveEmail(emails[0].email);
      }
    });

    onSnapshot(inboxQuery, (snapshot) => {
      if (snapshot.docs.length > 0) {
        setInbox(snapshot.docs[0].data().messages || []);
      }
    });
  };

  // Generate new temp email
  const generateTempEmail = async () => {
    if (!user) return alert("Please log in first!");
    setLoading(true);

    const randomId = generateRandomId();
    const newEmail = `${randomId}@temp.smsglobe.net`;

    try {
      await addDoc(collection(db, "tempEmails"), {
        email: newEmail,
        userId: user.uid,
        userEmail: user.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
      });

      await addDoc(collection(db, "inbox"), {
        tempEmail: newEmail,
        userId: user.uid,
        messages: [],
        updatedAt: new Date(),
      });

      setActiveEmail(newEmail);
    } catch (error) {
      alert("Error generating email: " + error);
    } finally {
      setLoading(false);
    }
  };

  // Copy email to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Refresh inbox
  const refreshInbox = () => {
    if (!user) return;
    fetchUserData(user.uid);
  };

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Smsglobe Temp Mail
                </h1>
                <p className="mt-2 opacity-90">
                  Secure, disposable emails for your online needs
                </p>
              </div>
              <button
                onClick={generateTempEmail}
                disabled={loading}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
              >
                <FiPlus />
                {loading ? "Creating..." : "New"}
              </button>
            </div>
          </div>

          {/* Current Email Display */}
          {activeEmail && (
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Your temporary email
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-mono font-bold text-indigo-800 break-all">
                      {activeEmail}
                    </p>
                    <button
                      onClick={copyToClipboard}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="Copy to clipboard"
                    >
                      <FiCopy />
                    </button>
                    {copied && (
                      <span className="text-sm text-green-600">Copied!</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={refreshInbox}
                    className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 rounded-lg transition-all"
                  >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List Sidebar */}
          <div className="bg-white rounded-xl border overflow-hidden lg:col-span-1 h-fit">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <FiMail />
                Your Email Addresses
              </h2>
            </div>
            <div className="divide-y">
              {tempEmails.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No emails generated yet
                </div>
              ) : (
                tempEmails.map((email, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveEmail(email.email)}
                    className={`p-4 cursor-pointer transition-colors ${
                      activeEmail === email.email
                        ? "bg-indigo-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-mono font-medium">{email.email}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <FiClock size={14} />
                      Created:{" "}
                      {new Date(
                        email.createdAt?.seconds * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Email Content Area */}
          <div className="bg-white rounded-xl border overflow-hidden lg:col-span-2">
            <div className="border-b">
              <div className="flex">
                <button
                  className={`px-6 py-3 font-medium flex items-center gap-2 ${
                    activeTab === "inbox"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("inbox")}
                >
                  <FiMail />
                  Inbox
                </button>
                <button
                  className={`px-6 py-3 font-medium flex items-center gap-2 ${
                    activeTab === "history"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  <FiClock />
                  History
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === "inbox" ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">
                    Received Messages
                  </h3>
                  {inbox.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FiMail
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p>Your inbox is empty</p>
                      <p className="text-sm mt-2">
                        Emails sent to {activeEmail} will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inbox.map((msg, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {msg.split("\n")[0]}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {msg.split("\n")[1]}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-4">Email History</h3>
                  <div className="space-y-4">
                    {tempEmails.map((email, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-mono font-medium">
                              {email.email}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                              <FiClock size={14} />
                              Created:{" "}
                              {new Date(
                                email.createdAt?.seconds * 1000
                              ).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              activeEmail === email.email
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {activeEmail === email.email
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempMail;
