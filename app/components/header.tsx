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

const Header = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Local states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("Detecting...");
  const [currency, setCurrency] = useState("NGN");
  const [flag, setFlag] = useState("");
  const [balance, setBalance] = useState(0);
  const [convertedBalance, setConvertedBalance] = useState("₦0.00");
  const [balanceDelta, setBalanceDelta] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [prevBalance, setPrevBalance] = useState(0);

  // User settings
  const [userSettings, setUserSettings] = useState<{
    currency: string;
    make_me_extra_private: boolean;
    username: string;
  } | null>(null);

  // Fetch user location
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setSelectedCountry(data.country_name || "Unknown");
        setCurrency(data.currency || "NGN");
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
            if (data.currency) setCurrency(data.currency);
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
            setPrevBalance(balance);
            setBalance(newBalance);

            // Calculate delta for animation
            if (newBalance !== balance) {
              setBalanceDelta(newBalance - balance);
              setTimeout(() => setBalanceDelta(0), 2000);
            }
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

  // Convert balance based on currency
  useEffect(() => {
    const formatBalance = () => {
      if (currency === "NGN") {
        setConvertedBalance(
          new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
          }).format(balance)
        );
      } else {
        // For USD conversion (simplified - in a real app you'd fetch rates)
        const converted = balance / 750; // Example rate
        setConvertedBalance(
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(converted)
        );
      }
    };

    formatBalance();
  }, [balance, currency]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
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

  // Balance change animation variants
  const balanceVariants = {
    initial: { y: 0, opacity: 1 },
    animate: { y: balanceDelta > 0 ? -20 : 20, opacity: 0 },
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
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
              <div className="relative flex items-center">
                <div className="bg-blue-50 rounded-lg px-3 py-2 flex items-center">
                  <span className="text-sm font-medium text-blue-800">
                    {convertedBalance}
                  </span>
                  {balanceDelta !== 0 && (
                    <AnimatePresence>
                      <motion.span
                        key={balance}
                        initial="initial"
                        animate="animate"
                        variants={balanceVariants}
                        transition={{ duration: 0.5 }}
                        className={`absolute -right-2 -top-4 text-xs px-1 rounded ${
                          balanceDelta > 0
                            ? "text-green-600 bg-green-50"
                            : "text-red-600 bg-red-50"
                        }`}
                      >
                        {balanceDelta > 0 ? "+" : ""}
                        {currency === "NGN" ? "₦" : "$"}
                        {Math.abs(balanceDelta).toFixed(2)}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </div>

                {/* Notifications */}
                <button className="ml-4 p-2 rounded-full hover:bg-gray-100 relative">
                  <FaBell className="text-gray-500" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center ml-4">
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <div className="relative">
                        <Image
                          src={user.photoURL || "/default-avatar.png"}
                          alt="User"
                          width={32}
                          height={32}
                          className="rounded-full"
                          onLoadingComplete={() => setIsLoadingImage(false)}
                          style={{
                            opacity: isLoadingImage ? 0 : 1,
                            transition: "opacity 0.3s ease",
                          }}
                          unoptimized={true} // Add this if you're still having issues
                        />
                        {userSettings?.make_me_extra_private && (
                          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full">
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
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {userSettings?.username || "Welcome"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                Pricing
              </Link>
              <Link href="/signin">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign In
                </button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center space-x-3">
          {user && (
            <>
              {/* Mobile Balance */}
              <div className="relative">
                <div className="bg-blue-50 rounded-lg px-2 py-1">
                  <span className="text-xs font-medium text-blue-800">
                    {convertedBalance.split(".")[0]}
                  </span>
                </div>
                {balanceDelta !== 0 && (
                  <AnimatePresence>
                    <motion.span
                      key={balance}
                      initial="initial"
                      animate="animate"
                      variants={balanceVariants}
                      transition={{ duration: 0.5 }}
                      className={`absolute -right-2 -top-3 text-[10px] px-1 rounded ${
                        balanceDelta > 0
                          ? "text-green-600 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      {balanceDelta > 0 ? "+" : ""}
                      {currency === "NGN" ? "₦" : "$"}
                      {Math.abs(balanceDelta).toFixed(2)}
                    </motion.span>
                  </AnimatePresence>
                )}
              </div>

              {/* Mobile User Avatar */}
              <div className="relative">
                <Image
                  src={user.photoURL || "/default-avatar.png"}
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full"
                  onLoadingComplete={() => setIsLoadingImage(false)}
                  style={{
                    opacity: isLoadingImage ? 0 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                />
                {userSettings?.make_me_extra_private && (
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full">
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
              <div className="p-4">
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
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={user.photoURL || "/default-avatar.png"}
                        alt="User"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {userSettings?.username || "Welcome"}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {convertedBalance}
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
                            {selectedCountry} ({currency})
                          </span>
                        </div>
                      </div>

                      <nav className="space-y-2">
                        <Link
                          href="/dashboard"
                          className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-50 rounded"
                        >
                          Sign Out
                        </button>
                      </nav>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href="/about"
                      className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      href="/pricing"
                      className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/signin"
                      className="block py-2 px-3 text-center bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
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
