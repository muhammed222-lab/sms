/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useRouter } from "next/navigation";
import { FaUserSecret } from "react-icons/fa";
import { MdArrowDropDown } from "react-icons/md";

const Header = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Local states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  // Default value is "NGN" but will be overridden by user settings
  const [currency, setCurrency] = useState<string>("NGN");
  const [flag, setFlag] = useState<string>("");

  const [balance, setBalance] = useState<number>(0);
  const [convertedBalance, setConvertedBalance] = useState<string>("0.00");
  const [balanceDelta, setBalanceDelta] = useState<number>(0);

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingFlag, setIsLoadingFlag] = useState(true);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // userSettings from Firestore (real‑time subscription)
  const [userSettings, setUserSettings] = useState<{
    currency: string;
    make_me_extra_private: boolean;
    username: string;
  } | null>(null);

  // Fetch user location, fallback currency, and flag
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const userCountry = data.country_name;
        const fallbackCurrency = data.currency;
        const userFlag = `https://flagcdn.com/w320/${data.country_code.toLowerCase()}.png`;

        setSelectedCountry(userCountry);
        // This fallback will be overridden if user settings exist
        setCurrency(fallbackCurrency);
        setFlag(userFlag);
        setIsLoadingFlag(false);
      } catch (error) {
        console.error("Error fetching user location:", error);
        setIsLoadingFlag(false);
      }
    };

    fetchUserLocation();
  }, []);

  // Monitor auth state and subscribe in real time to user settings and balance updates.
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        // Subscribe to user settings document (doc id equals currentUser.email)
        const settingsRef = doc(db, "settings", currentUser.email);
        const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as {
              currency: string;
              make_me_extra_private: boolean;
              username: string;
            };
            setUserSettings(data);
            setCurrency(data.currency); // override currency with setting value
          }
        });
        // Also subscribe to balance
        subscribeToBalance(currentUser.email);
        return () => unsubscribeSettings();
      } else {
        setBalance(0);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscribe to user balance updates
  const subscribeToBalance = (email: string) => {
    const q = query(
      collection(db, "userDeposits"),
      where("email", "==", email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const newBalance = userData.amount ?? 0;
        if (newBalance < balance) {
          setBalanceDelta(balance - newBalance);
          setTimeout(() => setBalanceDelta(0), 1000);
        }
        setBalance(newBalance);
      } else {
        setBalance(0);
      }
    });
    return unsubscribe;
  };

  // Referral bonus check remains unchanged
  const checkAndApplyReferralBonus = async (email: string) => {
    try {
      const q = query(
        collection(db, "refers"),
        where("user_email", "==", email)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const referralDoc = querySnapshot.docs[0];
        const referralData = referralDoc.data();
        if (!referralData?.bonus_applied) {
          const userDepositQuery = query(
            collection(db, "userDeposits"),
            where("email", "==", email)
          );
          const depositSnapshot = await getDocs(userDepositQuery);
          if (!depositSnapshot.empty) {
            const depositDoc = depositSnapshot.docs[0];
            const depositRef = doc(db, "userDeposits", depositDoc.id);
            await updateDoc(depositRef, {
              amount: (depositDoc.data().amount ?? 0) + 2000,
            });
            const referralRef = doc(db, "refers", referralDoc.id);
            await updateDoc(referralRef, {
              bonus_applied: true,
            });
            console.log("Referral bonus applied for", email);
          }
        }
      }
    } catch (error) {
      console.error("Error applying referral bonus:", error);
    }
  };

  // Convert balance based on user-selected currency (NGN or USD)
  useEffect(() => {
    const convertBalance = async () => {
      try {
        if (currency === "NGN") {
          const converted = balance.toFixed(2);
          setConvertedBalance(
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "NGN",
            }).format(parseFloat(converted))
          );
        } else {
          const response = await fetch(
            "https://api.exchangerate-api.com/v4/latest/NGN"
          );
          const data = await response.json();
          const conversionRate = data.rates["USD"] || 1;
          const converted = (balance * conversionRate).toFixed(2);
          setConvertedBalance(
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(parseFloat(converted))
          );
        }
      } catch (error) {
        console.error("Error converting balance:", error);
        setConvertedBalance("0.00");
      }
    };

    convertBalance();
  }, [balance, currency]);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b py-3 px-4">
        <div className="w-[90%] max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/favicon.png" alt="Logo" width={100} height={40} />
          </Link>

          <div className="flex items-center gap-2 lg:gap-4">
            {user && (
              <div className="relative">
                <span
                  className={`text-sm ${
                    balance === 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {convertedBalance || "Loading..."}
                </span>
                {balanceDelta > 0 && (
                  <span className="absolute -top-5 right-0 text-xs text-red-600 animate-flyout">
                    -
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currency === "NGN" ? "NGN" : "USD",
                    }).format(balanceDelta)}
                  </span>
                )}
              </div>
            )}
            <button
              className="lg:hidden text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              ☰
            </button>
          </div>

          {/* Sidebar Menu */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-40 bg-black bg-opacity-50">
              <div
                ref={menuRef}
                className="bg-white w-[70%] h-full fixed top-0 right-0 shadow-lg flex flex-col p-6"
              >
                <button
                  className="self-end text-xl text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close Menu"
                >
                  ✕
                </button>
                <ul className="flex flex-col gap-4 mt-4">
                  {!user ? (
                    <>
                      <li>
                        <Link href="/about" className="text-sm hover:underline">
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/pricing"
                          className="text-sm hover:underline"
                        >
                          Pricing
                        </Link>
                      </li>
                      <li>
                        <Link href="/signin">
                          <button className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600">
                            Sign In
                          </button>
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              user.photoURL ||
                              "https://www.gravatar.com/avatar?d=mp"
                            }
                            alt="User profile"
                            className="w-8 h-8 rounded-full"
                            onLoad={() => setIsLoadingImage(false)}
                            style={{
                              opacity: isLoadingImage ? 0 : 1,
                              transition: "opacity 0.3s ease",
                            }}
                          />
                          {/* Greeting with dropdown: if username is set, display it; else prompt "+ Add Username" */}
                          {!userSettings?.make_me_extra_private ? (
                            <div className="relative">
                              <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1 focus:outline-none"
                              >
                                <span className="text-sm text-gray-800">
                                  {userSettings &&
                                  userSettings.username.trim() !== ""
                                    ? userSettings.username
                                    : "+ Add Username"}
                                </span>
                                <MdArrowDropDown className="text-xl cursor-pointer" />
                              </button>
                              {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                                  <button
                                    onClick={() => {
                                      router.push(
                                        "/dashboard?activePage=Settings"
                                      );
                                      setDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                  >
                                    Change Username
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <FaUserSecret
                                className="text-xl"
                                title="all your request are private"
                              />
                              <span className="hidden sm:inline text-xs text-gray-800">
                                (all your request are private)
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                      <li>
                        <Link
                          href="/dashboard"
                          className="text-sm hover:underline"
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li className="flex items-center gap-2">
                        {isLoadingFlag ? (
                          <span className="text-sm text-gray-500">
                            Loading...
                          </span>
                        ) : (
                          <img
                            src={flag}
                            alt={`${selectedCountry} Flag`}
                            className="w-5 h-5 rounded-sm"
                            style={{
                              opacity: flag ? 1 : 0,
                              transition: "opacity 0.3s ease",
                            }}
                          />
                        )}
                        <span className="text-sm text-gray-800">
                          {selectedCountry} ({currency})
                        </span>
                      </li>
                      <li>
                        <button
                          onClick={handleSignOut}
                          className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600"
                        >
                          Sign Out
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-6">
            {!user ? (
              <>
                <Link href="/about" className="text-sm hover:underline">
                  About Us
                </Link>
                <Link href="/pricing" className="text-sm hover:underline">
                  Pricing
                </Link>
                <Link href="/signin">
                  <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                    Sign In
                  </button>
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <img
                    src={
                      user.photoURL || "https://www.gravatar.com/avatar?d=mp"
                    }
                    alt="User profile"
                    className="w-8 h-8 rounded-full"
                    onLoad={() => setIsLoadingImage(false)}
                    style={{
                      opacity: isLoadingImage ? 0 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                  />
                  {!userSettings?.make_me_extra_private ? (
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-1 focus:outline-none"
                      >
                        <span className="text-sm text-gray-800">
                          {userSettings && userSettings.username.trim() !== ""
                            ? userSettings.username
                            : "+ Add Username"}
                        </span>
                        <MdArrowDropDown className="text-xl cursor-pointer" />
                      </button>
                      {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <button
                            onClick={() => {
                              router.push("/dashboard?activePage=Settings");
                              setDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Change Username
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <FaUserSecret
                        className="text-xl"
                        title="all your request are private"
                      />
                      <span className="hidden sm:inline text-xs text-gray-800">
                        (all your request are private)
                      </span>
                    </div>
                  )}
                </div>
                <Link href="/dashboard" className="text-sm hover:underline">
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  {isLoadingFlag ? (
                    <span className="text-sm text-gray-500">Loading...</span>
                  ) : (
                    <img
                      src={flag}
                      alt={`${selectedCountry} Flag`}
                      className="w-5 h-5 rounded-sm"
                      style={{
                        opacity: flag ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                  )}
                  <span className="text-sm text-gray-800">
                    {selectedCountry} ({currency})
                  </span>
                </div>
                <span
                  className={`text-sm ${
                    balance === 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Balance: {convertedBalance || "Loading..."}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <style jsx>{`
        @keyframes flyout {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        .animate-flyout {
          animation: flyout 1s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Header;
