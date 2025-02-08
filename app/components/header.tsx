"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useRouter } from "next/navigation";
// import Status from "./status";

const Header = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [currency, setCurrency] = useState<string>("NGN");
  const [flag, setFlag] = useState<string>("");

  const [balance, setBalance] = useState<number>(0);
  const [convertedBalance, setConvertedBalance] = useState<string>("0.00");

  const [user, setUser] = useState<User | null>(null); // Firebase user state
  const [isLoadingFlag, setIsLoadingFlag] = useState(true); // Track flag loading
  const [isLoadingImage, setIsLoadingImage] = useState(true); // Track image loading

  // Fetch user location, currency, and flag
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const userCountry = data.country_name;
        const userCurrency = data.currency;
        const userFlag = `https://flagcdn.com/w320/${data.country_code.toLowerCase()}.png`;

        setSelectedCountry(userCountry);
        setCurrency(userCurrency);
        setFlag(userFlag);
        setIsLoadingFlag(false); // Mark flag loading complete
      } catch (error) {
        console.error("Error fetching user location:", error);
        setIsLoadingFlag(false); // Mark flag loading complete
      }
    };

    fetchUserLocation();
  }, []);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        await checkAndApplyReferralBonus(currentUser.email);
        fetchUserBalance(currentUser.email);
      } else {
        setBalance(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user balance from Firestore
  const fetchUserBalance = async (email: string) => {
    try {
      const q = query(
        collection(db, "userDeposits"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setBalance(userData.amount ?? 0);
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

  // Check and apply referral bonus if applicable
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

            // Add 2,000 to the user's balance
            await updateDoc(depositRef, {
              amount: (depositDoc.data().amount ?? 0) + 2000,
            });

            // Update the referral document to mark bonus as applied
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

  // Fetch exchange rates and convert balance
  useEffect(() => {
    const convertBalance = async () => {
      try {
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/NGN"
        );
        const data = await response.json();
        const conversionRate = data.rates[currency] || 1;
        const converted = (balance * conversionRate).toFixed(2);

        setConvertedBalance(
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
          }).format(parseFloat(converted))
        );
      } catch (error) {
        console.error("Error converting balance:", error);
        setConvertedBalance("0.00");
      }
    };

    if (currency) {
      convertBalance();
    }
  }, [balance, currency]);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent body scrolling
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
      router.push("/signin"); // Redirect to sign-in page after sign-out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b py-3 px-4">
      {/* <Status /> */}
      <div className="w-[90%] max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image src="/favicon.png" alt="Logo" width={100} height={40} />
        </Link>

        {/* Balance */}
        <div className="flex items-center gap-2 lg:gap-4">
          {user && (
            <span
              className={`text-sm ${
                balance === 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {convertedBalance || "Loading..."}
            </span>
          )}

          {/* Mobile Menu Toggle */}
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
                      <Link href="/pricing" className="text-sm hover:underline">
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
                        <span className="text-sm text-gray-800">
                          Hello, {user.displayName || user.email}!
                        </span>
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
                  src={user.photoURL || "https://www.gravatar.com/avatar?d=mp"}
                  alt="User profile"
                  className="w-8 h-8 rounded-full"
                  onLoad={() => setIsLoadingImage(false)}
                  style={{
                    opacity: isLoadingImage ? 0 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                />
                <span className="text-sm text-gray-800">
                  Hello, {user.displayName || user.email}!
                </span>
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
  );
};

export default Header;
