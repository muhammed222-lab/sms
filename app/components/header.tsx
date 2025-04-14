/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useRouter } from "next/navigation";
import { FaUserSecret, FaBell, FaChevronDown } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  message: string;
  amount: number;
  type: "increase" | "decrease";
  timestamp: number;
  read: boolean;
};

const Header = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Local states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("Detecting...");
  const [currency, setCurrency] = useState("USD");
  const [flag, setFlag] = useState("");
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [prevBalance, setPrevBalance] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // User settings
  const [userSettings, setUserSettings] = useState<{
    currency: string;
    make_me_extra_private: boolean;
    username: string;
  } | null>(null);

  // Format balance in USD
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Load notifications from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotifications = localStorage.getItem("notifications");
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
      }
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notifications", JSON.stringify(notifications));
      setUnreadCount(notifications.filter((n) => !n.read).length);
    }
  }, [notifications]);

  // Fetch user location
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setSelectedCountry(data.country_name || "Unknown");
        setFlag(
          `https://flagcdn.com/w40/${data.country_code.toLowerCase()}.png`
        );
      } catch (error) {
        console.error("Error fetching location:", error);
        setFlag("/default-flag.png"); // Fallback flag
      }
    };

    fetchUserLocation();
  }, []);

  // Handle balance changes and create notifications
  const handleBalanceChange = (newBalance: number) => {
    if (balance !== newBalance) {
      const difference = newBalance - balance;

      // Create notification
      if (Math.abs(difference) > 0.01) {
        // Avoid tiny changes
        const newNotification: Notification = {
          id: Date.now().toString(),
          message:
            difference > 0
              ? `Your data is up to date! (data loaded)`
              : `You purchased a service`,
          amount: Math.abs(difference),
          type: difference > 0 ? "increase" : "decrease",
          timestamp: Date.now(),
          read: false,
        };

        setNotifications((prev) => [newNotification, ...prev]);
      }

      setPrevBalance(balance);
      setBalance(newBalance);
    }
  };

  // Auth state and data subscriptions
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        // Subscribe to user settings
        const settingsRef = doc(db, "settings", currentUser.email);
        const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as {
              currency: string;
              make_me_extra_private: boolean;
              username: string;
            };
            setUserSettings(data);
          }
        });

        // Subscribe to balance
        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", currentUser.email)
        );
        const unsubscribeBalance = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const newBalance = snapshot.docs[0].data().amount || 0;
            handleBalanceChange(newBalance);
          }
        });

        return () => {
          unsubscribeSettings();
          unsubscribeBalance();
        };
      } else {
        setBalance(0);
      }
    });

    return () => unsubscribeAuth();
  }, [balance]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
    if (notificationsOpen) {
      markAllAsRead();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/favicon.png"
            alt="Logo"
            width={120}
            height={48}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {user ? (
            <>
              {/* Balance Display */}
              <div className="relative flex items-center space-x-4">
                <div className="bg-blue-50 rounded-lg px-4 py-2 flex items-center shadow-inner">
                  <span className="text-sm font-medium text-blue-800 whitespace-nowrap">
                    {formatBalance(balance)}
                  </span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={handleNotificationClick}
                    className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
                  >
                    <FaBell className="text-gray-500" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          Notifications
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark all as read
                          </button>
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Clear all
                          </button>
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-100 ${
                                !notification.read ? "bg-blue-50" : ""
                              }`}
                            >
                              <p className="text-sm text-gray-800">
                                {notification.message}
                                {notification.type === "decrease" && (
                                  <span className="font-medium">
                                    {" "}
                                    {formatBalance(notification.amount)}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                  notification.timestamp
                                ).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <div className="flex items-center" ref={dropdownRef}>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <div className="relative">
                        <Image
                          src={user.photoURL || "/avatar.png"}
                          alt="User"
                          width={36}
                          height={36}
                          className="rounded-full border-2 border-gray-200"
                          onLoadingComplete={() => setIsLoadingImage(false)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/avatar.png";
                          }}
                          style={{
                            opacity: isLoadingImage ? 0 : 1,
                            transition: "opacity 0.3s ease",
                          }}
                          unoptimized={true}
                        />
                        {userSettings?.make_me_extra_private && (
                          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                            <FaUserSecret className="text-xs text-gray-600" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden md:inline">
                        {userSettings?.username || "Account"}
                      </span>
                      <FaChevronDown
                        className={`text-xs text-gray-500 transition-transform ${
                          dropdownOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {userSettings?.username || "Welcome"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                Pricing
              </Link>
              <Link href="/signin">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                  Sign In
                </button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center space-x-4">
          {user && (
            <>
              {/* Mobile Notifications */}
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <FaBell className="text-gray-500 text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Notifications Dropdown */}
                {notificationsOpen && (
                  <div
                    ref={notificationRef}
                    className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end"
                  >
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "tween" }}
                      className="w-4/5 h-full bg-white shadow-xl"
                    >
                      <div className="p-4 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Notifications</h3>
                          <button
                            onClick={() => setNotificationsOpen(false)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            <IoMdClose className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex space-x-2 mb-4">
                          <button
                            onClick={markAllAsRead}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded text-sm"
                          >
                            Mark all as read
                          </button>
                          <button
                            onClick={clearAllNotifications}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded text-sm"
                          >
                            Clear all
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                              No notifications
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 border-b border-gray-100 ${
                                  !notification.read ? "bg-blue-50" : ""
                                }`}
                              >
                                <p className="text-sm text-gray-800">
                                  {notification.message}
                                  {notification.type === "decrease" && (
                                    <span className="font-medium">
                                      {" "}
                                      {formatBalance(notification.amount)}
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Mobile Balance */}
              <div className="bg-blue-50 rounded-lg px-3 py-1 shadow-inner">
                <span className="text-xs font-medium text-blue-800 whitespace-nowrap">
                  {formatBalance(balance).split(".")[0]}
                </span>
              </div>

              {/* Mobile User Avatar */}
              <div className="relative">
                <Image
                  src={user.photoURL || "/avatar.png"}
                  alt="User"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/avatar.png";
                  }}
                />
                {userSettings?.make_me_extra_private && (
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                    <FaUserSecret className="text-xs text-gray-600" />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <GiHamburgerMenu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
          >
            <motion.div
              ref={menuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
              className="absolute top-0 right-0 w-4/5 h-full bg-white shadow-xl"
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <Image
                    src="/favicon.png"
                    alt="Logo"
                    width={100}
                    height={40}
                  />
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <IoMdClose className="w-5 h-5" />
                  </button>
                </div>

                {user ? (
                  <div className="space-y-6 flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Image
                          src={user.photoURL || "/avatar.png"}
                          alt="User"
                          width={48}
                          height={48}
                          className="rounded-full border-2 border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/avatar.png";
                          }}
                        />
                        {userSettings?.make_me_extra_private && (
                          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                            <FaUserSecret className="text-xs text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate">
                          {userSettings?.username || "Welcome"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="bg-gray-50 p-3 rounded-lg shadow-inner">
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatBalance(balance)}
                        </p>
                        <div className="flex items-center mt-1">
                          {flag && (
                            <img
                              src={flag}
                              alt="Flag"
                              className="w-4 h-4 mr-2"
                            />
                          )}
                          <span className="text-xs text-gray-500">
                            {selectedCountry} (USD)
                          </span>
                        </div>
                      </div>

                      <nav className="space-y-2">
                        <Link
                          href="/dashboard"
                          className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        >
                          Sign Out
                        </button>
                      </nav>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1">
                    <Link
                      href="/about"
                      className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      href="/pricing"
                      className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <div className="pt-4">
                      <Link
                        href="/signin"
                        className="block py-2 px-3 text-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
