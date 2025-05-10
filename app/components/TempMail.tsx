/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import {
  FiRefreshCw,
  FiCopy,
  FiMail,
  FiClock,
  FiPlus,
  FiTrash2,
  FiPaperclip,
  FiShare2,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";

interface Message {
  id: string;
  from: { address: string; name: string };
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
  html?: string[];
  text?: string;
  hasAttachments?: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
}

interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
}

interface Account {
  email: string;
  createdAt: any;
  id: string;
  address: string;
  password: string;
  token?: string;
}

const TempMail = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");
  const [copied, setCopied] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [forwardingEmail, setForwardingEmail] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const previousMessagesRef = useRef<Message[]>([]);

  // API base URL
  const API_BASE = "https://api.mail.tm";

  // Check and request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

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

  // Fetch domains when component mounts
  useEffect(() => {
    fetchDomains();
  }, []);

  // Set up message polling and account status checking
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAccount) {
        checkAccountStatus(activeAccount);
        fetchMessages();
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [activeAccount]);

  // Show notification for new messages
  const showNewMessageNotification = (newMessages: Message[]) => {
    if (notificationPermission === "granted" && newMessages.length > 0) {
      const notification = new Notification(
        `You have ${newMessages.length} new message(s)`,
        {
          body: newMessages
            .map((msg) => `${msg.from.address}: ${msg.subject}`)
            .join("\n"),
          icon: "/mail-icon.png",
        }
      );

      notification.onclick = () => {
        window.focus();
      };
    }
  };

  // Compare previous and current messages to detect new ones
  useEffect(() => {
    if (messages.length > 0 && previousMessagesRef.current.length > 0) {
      const newMessages = messages.filter(
        (msg) =>
          !previousMessagesRef.current.some((prevMsg) => prevMsg.id === msg.id)
      );

      if (newMessages.length > 0) {
        setNewMessageCount((prev) => prev + newMessages.length);
        showNewMessageNotification(newMessages);
      }
    }
    previousMessagesRef.current = messages;
  }, [messages]);

  // Fetch domains from Mail.tm
  const fetchDomains = async () => {
    try {
      const response = await fetch(`${API_BASE}/domains`);
      const data = await response.json();
      if (response.ok) {
        setDomains(data["hydra:member"]);
      } else {
        console.error("Error fetching domains:", data);
        toast.error("Failed to fetch domains");
      }
    } catch (error) {
      console.error("Network error fetching domains:", error);
      toast.error("Network error fetching domains");
    }
  };

  // Check if account still exists
  const checkAccountStatus = async (account: Account) => {
    try {
      const response = await fetch(`${API_BASE}/accounts/${account.id}`, {
        headers: {
          Authorization: `Bearer ${account.token}`,
        },
      });

      if (!response.ok) {
        handleDeletedAccount(account.address);
      }
    } catch (error) {
      console.error("Error checking account status:", error);
    }
  };

  // Fetch user data from Firestore
  const fetchUserData = (userId: string) => {
    const tempEmailQuery = query(
      collection(db, "tempEmails"),
      where("userId", "==", userId)
    );

    return onSnapshot(tempEmailQuery, (snapshot) => {
      const accounts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Account[];
      setAccounts(accounts);
      if (accounts.length > 0 && !activeAccount) {
        setActiveAccount(accounts[0]);
        loginToAccount(accounts[0].address, accounts[0].password);
      }
    });
  };

  // Login to Mail.tm account and get token
  const loginToAccount = async (address: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Find and update the account in local state
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.address === address ? { ...acc, token: data.token } : acc
          )
        );

        // Update active account with new token
        setActiveAccount((prev) =>
          prev?.address === address ? { ...prev, token: data.token } : prev
        );

        fetchMessages(data.token);
      } else {
        console.error("Login error:", data);
        toast.error("Failed to login to email account");
        if (data.code === 401 && data.message.includes("no longer exists")) {
          handleDeletedAccount(address);
        }
      }
    } catch (error) {
      console.error("Network error during login:", error);
      toast.error("Network error during login");
    }
  };

  // Handle deleted accounts
  const handleDeletedAccount = async (address: string) => {
    // Remove from local state
    setAccounts((prev) => prev.filter((acc) => acc.address !== address));

    // Clear if it was the active account
    if (activeAccount?.address === address) {
      setActiveAccount(null);
      setMessages([]);
    }

    // Update Firestore (mark as inactive)
    try {
      const accountRef = doc(db, "tempEmails", address);
      await deleteDoc(accountRef);
      toast.warning(
        "This temporary email has expired. Please create a new one."
      );
    } catch (error) {
      console.error("Error deleting account from Firestore:", error);
    }
  };

  // Fetch messages for the current account
  const fetchMessages = async (token?: string) => {
    const authToken = token || activeAccount?.token;
    if (!authToken) return;

    try {
      const response = await fetch(`${API_BASE}/messages?page=1`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const messagesWithAttachments = await Promise.all(
          data["hydra:member"].map(async (msg: any) => {
            const hasAttachments = msg.hasAttachments || false;
            let attachments: Attachment[] = [];

            if (hasAttachments) {
              try {
                const attachmentsResponse = await fetch(
                  `${API_BASE}/messages/${msg.id}/attachments`,
                  {
                    headers: {
                      Authorization: `Bearer ${authToken}`,
                    },
                  }
                );

                if (attachmentsResponse.ok) {
                  const attachmentsData = await attachmentsResponse.json();
                  attachments = attachmentsData["hydra:member"] || [];
                }
              } catch (error) {
                console.error("Error fetching attachments:", error);
              }
            }

            return {
              id: msg.id,
              from: msg.from,
              subject: msg.subject,
              intro: msg.intro,
              seen: msg.seen,
              createdAt: msg.createdAt,
              hasAttachments,
              attachments,
            };
          })
        );

        setMessages(messagesWithAttachments);
        setLastRefresh(Date.now());
      } else {
        console.error("Error fetching messages:", data);
        toast.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Network error fetching messages:", error);
      toast.error("Network error fetching messages");
    }
  };

  // Generate new temp email
  const generateTempEmail = async () => {
    if (!user || domains.length === 0) return;
    setLoading(true);

    try {
      // Generate random username and password
      const randomId = Math.random().toString(36).substring(2, 8);
      const password = Math.random().toString(36).substring(2, 12);
      const domain = domains[0].domain;
      const address = `${randomId}@${domain}`;

      // Create account with Mail.tm
      const createResponse = await fetch(`${API_BASE}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, password }),
      });

      const createData = await createResponse.json();

      if (createResponse.ok) {
        // Login to the new account to get token
        const loginResponse = await fetch(`${API_BASE}/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, password }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          const newAccount: Account = {
            id: createData.id,
            address,
            password,
            token: loginData.token,
            email: address,
            createdAt: new Date(),
          };

          // Save to Firestore
          await addDoc(collection(db, "tempEmails"), {
            ...newAccount,
            userId: user.uid,
            userEmail: user.email,
            isActive: true,
            createdAt: new Date(),
          });

          setActiveAccount(newAccount);
          fetchMessages(loginData.token);
          toast.success("Temporary email created successfully!");
        }
      } else {
        toast.error("Failed to create temporary email");
        console.error("Error creating account:", createData);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Error creating temporary email");
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const deleteAccount = async (accountId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE}/accounts/${accountId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
        if (activeAccount?.id === accountId) {
          setActiveAccount(null);
          setMessages([]);
        }
        toast.success("Email account deleted successfully");
      } else {
        console.error("Error deleting account:", await response.json());
        toast.error("Failed to delete email account");
      }
    } catch (error) {
      console.error("Network error deleting account:", error);
      toast.error("Network error deleting account");
    }
  };

  // Copy email to clipboard
  const copyToClipboard = () => {
    if (!activeAccount) return;
    navigator.clipboard.writeText(activeAccount.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Email copied to clipboard!");
  };

  // Refresh inbox
  const refreshInbox = () => {
    if (!activeAccount) return;
    fetchMessages();
    toast.info("Refreshing inbox...");
  };

  // View message details
  const viewMessage = async (messageId: string) => {
    try {
      const authToken = activeAccount?.token;
      if (!authToken) {
        console.error("No active account token found.");
        toast.error("No active account");
        return;
      }

      const response = await fetch(`${API_BASE}/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const messageDetails = await response.json();
        setSelectedMessage({
          ...messageDetails,
          id: messageId,
          hasAttachments: messageDetails.hasAttachments || false,
        });

        // Mark as read if not already
        if (!messageDetails.seen) {
          await toggleMessageRead(messageId, true);
        }
      } else {
        console.error("Error fetching message details:", await response.json());
        toast.error("Failed to fetch message details");
      }
    } catch (error) {
      console.error("Network error fetching message details:", error);
      toast.error("Network error fetching message");
    }
  };

  // Close message detail view
  const closeMessageDetail = () => {
    setSelectedMessage(null);
  };

  // Mark message as read/unread
  const toggleMessageRead = async (messageId: string, isRead: boolean) => {
    try {
      const authToken = activeAccount?.token;
      if (!authToken) {
        console.error("No active account token found.");
        return;
      }

      const response = await fetch(`${API_BASE}/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seen: isRead }),
      });

      if (response.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, seen: isRead } : m))
        );
        if (selectedMessage?.id === messageId) {
          setSelectedMessage((prev) =>
            prev ? { ...prev, seen: isRead } : null
          );
        }
      } else {
        console.error("Error updating message status:", await response.json());
      }
    } catch (error) {
      console.error("Network error updating message status:", error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      const authToken = activeAccount?.token;
      if (!authToken) {
        console.error("No active account token found.");
        return;
      }

      const response = await fetch(`${API_BASE}/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        toast.success("Message deleted successfully");
      } else {
        console.error("Error deleting message:", await response.json());
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Network error deleting message:", error);
      toast.error("Network error deleting message");
    }
  };

  // Forward message
  const forwardMessage = async () => {
    if (!selectedMessage || !forwardingEmail) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsForwarding(true);
    try {
      // In a real implementation, you would send the message to your backend
      // which would then forward it using a mail service
      // This is just a simulation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Message forwarded to ${forwardingEmail} successfully!`);
      setForwardingEmail("");
      setIsForwarding(false);
    } catch (error) {
      console.error("Error forwarding message:", error);
      toast.error("Failed to forward message");
      setIsForwarding(false);
    }
  };

  // Download attachment
  const downloadAttachment = async (
    attachmentUrl: string,
    filename: string
  ) => {
    try {
      const authToken = activeAccount?.token;
      if (!authToken) {
        console.error("No active account token found.");
        return;
      }

      const response = await fetch(attachmentUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Attachment downloaded successfully");
      } else {
        console.error("Error downloading attachment:", await response.json());
        toast.error("Failed to download attachment");
      }
    } catch (error) {
      console.error("Network error downloading attachment:", error);
      toast.error("Network error downloading attachment");
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Temporary Email Service
                </h1>
                <p className="mt-2 opacity-90">
                  Secure, disposable emails with full functionality
                </p>
              </div>
              <div className="flex items-center gap-3">
                {newMessageCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {newMessageCount} new
                  </span>
                )}
                <button
                  onClick={generateTempEmail}
                  disabled={loading}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  <FiPlus />
                  {loading ? "Creating..." : "New Email"}
                </button>
              </div>
            </div>
          </div>

          {/* Current Email Display */}
          {activeAccount && (
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">
                      Your temporary email
                    </p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-mono font-bold text-indigo-800 break-all">
                      {activeAccount.email}
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
                    <FiRefreshCw
                      className={loading ? "animate-spin" : ""}
                      size={18}
                    />
                    Refresh
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                <FiClock size={14} />
                Last refreshed: {moment(lastRefresh).fromNow()}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List Sidebar */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden lg:col-span-1 h-fit sticky top-6">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <FiMail />
                Your Email Addresses
              </h2>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {accounts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <FiMail size={24} className="mx-auto mb-2 text-gray-300" />
                  No emails generated yet
                  <button
                    onClick={generateTempEmail}
                    className="mt-3 text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-1"
                  >
                    <FiPlus /> Create one now
                  </button>
                </div>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => {
                      setActiveAccount(account);
                      loginToAccount(account.email, account.password);
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      activeAccount?.address === account.address
                        ? "bg-indigo-50 border-l-4 border-indigo-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-medium text-sm break-all truncate">
                          {account.email}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <FiClock size={12} />
                          {moment(account.createdAt?.seconds * 1000).fromNow()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              "Are you sure you want to delete this email account?"
                            )
                          ) {
                            deleteAccount(account.id, account.token || "");
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                        title="Delete account"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Email Content Area */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden lg:col-span-2">
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
                  {newMessageCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {newMessageCount}
                    </span>
                  )}
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
                  {!activeAccount ? (
                    <div className="text-center py-8 text-gray-500">
                      <FiMail
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p>No active email account</p>
                      <p className="text-sm mt-2">
                        Select an email account or create a new one to view
                        messages
                      </p>
                      <button
                        onClick={generateTempEmail}
                        className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-1 mx-auto"
                      >
                        <FiPlus /> Create New Email
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FiMail
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p>Your inbox is empty</p>
                      <p className="text-sm mt-2">
                        Emails sent to {activeAccount.email} will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                            msg.seen
                              ? "bg-white hover:bg-gray-50"
                              : "bg-blue-50 hover:bg-blue-100"
                          } ${
                            selectedMessage?.id === msg.id
                              ? "ring-2 ring-indigo-500"
                              : ""
                          }`}
                          onClick={() => viewMessage(msg.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">
                                  {msg.subject || "(No subject)"}
                                </p>
                                {msg.hasAttachments && (
                                  <FiPaperclip
                                    className="text-gray-400 flex-shrink-0"
                                    size={16}
                                  />
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1 truncate">
                                From:{" "}
                                {msg.from.name
                                  ? `${msg.from.name} <${msg.from.address}>`
                                  : msg.from.address}
                              </p>
                              <p className="text-sm mt-2 text-gray-600 line-clamp-2">
                                {msg.intro}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-2">
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {moment(msg.createdAt).fromNow()}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMessageRead(msg.id, !msg.seen);
                                  }}
                                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                                  title={
                                    msg.seen ? "Mark as unread" : "Mark as read"
                                  }
                                >
                                  {msg.seen ? (
                                    <FiEyeOff size={16} />
                                  ) : (
                                    <FiEye size={16} />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this message?"
                                      )
                                    ) {
                                      deleteMessage(msg.id);
                                    }
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete message"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-4">Email History</h3>
                  <div className="space-y-3">
                    {accounts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FiMail
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>No email history available</p>
                        <button
                          onClick={generateTempEmail}
                          className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-1 mx-auto"
                        >
                          <FiPlus /> Create New Email
                        </button>
                      </div>
                    ) : (
                      accounts.map((account) => (
                        <div
                          key={account.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <p className="font-mono font-medium text-sm break-all">
                                {account.email}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <FiClock size={12} />
                                Created:{" "}
                                {moment(
                                  account.createdAt?.seconds * 1000
                                ).format("LLL")}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                activeAccount?.email === account.email
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {activeAccount?.email === account.email
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {selectedMessage.subject}
              </h3>
              <button
                onClick={closeMessageDetail}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      From:{" "}
                      <span className="text-gray-600">
                        {selectedMessage.from.name
                          ? `${selectedMessage.from.name} <${selectedMessage.from.address}>`
                          : selectedMessage.from.address}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Date: {moment(selectedMessage.createdAt).format("LLL")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        toggleMessageRead(
                          selectedMessage.id,
                          !selectedMessage.seen
                        )
                      }
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title={
                        selectedMessage.seen ? "Mark as unread" : "Mark as read"
                      }
                    >
                      {selectedMessage.seen ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this message?"
                          )
                        ) {
                          deleteMessage(selectedMessage.id);
                          closeMessageDetail();
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete message"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                {selectedMessage.html ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedMessage.html.join(""),
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-line">
                    {selectedMessage.text || selectedMessage.intro}
                  </p>
                )}
              </div>

              {selectedMessage.hasAttachments &&
                selectedMessage.attachments &&
                selectedMessage.attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FiPaperclip />
                      Attachments ({selectedMessage.attachments.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedMessage.attachments.map((attachment, idx) => (
                        <div
                          key={idx}
                          className="border rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <FiPaperclip className="text-gray-400 flex-shrink-0" />
                            <div className="truncate">
                              <p className="truncate font-medium">
                                {attachment.filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              downloadAttachment(
                                attachment.url,
                                attachment.filename
                              )
                            }
                            className="text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                            title="Download attachment"
                          >
                            <FiDownload size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <div className="p-6 border-t">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="email"
                  value={forwardingEmail}
                  onChange={(e) => setForwardingEmail(e.target.value)}
                  placeholder="Enter email to forward to"
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={forwardMessage}
                  disabled={isForwarding || !forwardingEmail}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isForwarding ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Forwarding...
                    </>
                  ) : (
                    <>
                      <FiShare2 />
                      Forward
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempMail;
