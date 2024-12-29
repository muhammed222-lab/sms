"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  useUser,
  SignOutButton,
  SignInButton,
} from "@clerk/nextjs";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isSignedIn } = useUser();
  const menuRef = useRef<HTMLDivElement>(null);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [flag, setFlag] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [convertedBalance, setConvertedBalance] = useState<number | null>(null);
  const [formattedBalance, setFormattedBalance] = useState<string>("");

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
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };

    fetchUserLocation();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

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

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (isSignedIn && user) {
        try {
          const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";

          const q = query(
            collection(db, "userDeposits"),
            where("email", "==", userEmail)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.email === userEmail) {
              setBalance(userData.amount ?? 0);
            } else {
              setBalance(0);
            }
          } else {
            setBalance(0);
          }
        } catch (error) {
          console.error("Error fetching user balance:", error);
        }
      }
    };

    fetchUserBalance();
  }, [isSignedIn, user]);

  useEffect(() => {
    let unsubscribeFromFirestore = () => {};

    if (isSignedIn && user) {
      try {
        const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";

        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", userEmail)
        );

        // Listen for real-time updates to the user's balance
        unsubscribeFromFirestore = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            if (userData.email === userEmail) {
              setBalance(userData.amount ?? 0);
            } else {
              setBalance(0);
            }
          } else {
            setBalance(0);
          }
        });
      } catch (error) {
        console.error("Error setting up Firestore listener:", error);
      }
    }

    // Cleanup Firestore listener when the component unmounts or user signs out
    return () => {
      unsubscribeFromFirestore();
    };
  }, [isSignedIn, user]);

  useEffect(() => {
    const convertCurrency = async () => {
      if (!currency || currency === "N/A" || balance === 0) {
        setConvertedBalance(balance);
        setFormattedBalance(
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
          }).format(balance)
        );
        return;
      }

      try {
        const response = await fetch(
          `https://api.exchangerate.host/convert?from=NGN&to=${currency}&amount=${balance}`
        );
        const data = await response.json();

        if (data.result) {
          setConvertedBalance(data.result);
          setFormattedBalance(
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currency,
            }).format(data.result)
          );
        } else {
          setConvertedBalance(balance);
          setFormattedBalance(
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "NGN",
            }).format(balance)
          );
        }
      } catch (error) {
        console.error("Error converting currency:", error);
        setConvertedBalance(balance);
        setFormattedBalance(
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
          }).format(balance)
        );
      }
    };

    convertCurrency();
  }, [currency, balance]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b py-3 px-4">
      <div className="w-[90%] max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/">
          <Image src="/favicon.png" alt="Logo" width={100} height={40} />
        </Link>

        <button
          className="lg:hidden text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          ☰
        </button>

        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50">
            <div
              ref={menuRef}
              className="bg-white w-[60%] h-screen absolute top-0 right-0 shadow-lg flex flex-col p-6"
            >
              <button
                className="self-end text-xl text-gray-600"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close Menu"
              >
                ✕
              </button>
              <ul className="flex flex-col gap-4 flex-grow mt-4">
                <SignedOut>
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
                </SignedOut>
                <SignedIn>
                  <li>
                    <span className="text-sm text-gray-800">
                      Hello, {user?.firstName}!
                    </span>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-sm hover:underline">
                      Dashboard
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    {flag ? (
                      <img
                        src={flag}
                        alt={`${selectedCountry} Flag`}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-sm"
                      />
                    ) : (
                      <span>No flag available</span>
                    )}
                    <span className="text-sm text-gray-800">
                      {selectedCountry} ({currency})
                    </span>
                  </li>
                  <li>
                    <span
                      className={`text-sm ${
                        convertedBalance === 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      Balance:{" "}
                      {formattedBalance !== ""
                        ? formattedBalance
                        : "Loading..."}
                    </span>
                  </li>
                </SignedIn>
              </ul>
              {isSignedIn && user?.emailAddresses?.[0]?.emailAddress && (
                <div className="mt-auto text-xs text-gray-600">
                  Signed in as: {user.emailAddresses[0].emailAddress}
                </div>
              )}
            </div>
          </div>
        )}

        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          <ul className="flex items-center gap-6">
            <SignedOut>
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
            </SignedOut>
            <SignedIn>
              <li>
                <span className="text-sm text-gray-800">
                  Hello, {user?.firstName}!
                </span>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm hover:underline">
                  Dashboard
                </Link>
              </li>
              <li className="flex items-center gap-2">
                {flag ? (
                  <img
                    src={flag}
                    alt={`${selectedCountry} Flag`}
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded-sm"
                  />
                ) : (
                  <span>No flag available</span>
                )}
                <span className="text-sm text-gray-800">
                  {selectedCountry} ({currency})
                </span>
              </li>
              <li>
                <span
                  className={`text-sm ${
                    convertedBalance === 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Balance:{" "}
                  {formattedBalance !== "" ? formattedBalance : "Loading..."}
                </span>
              </li>
            </SignedIn>
          </ul>

          <div className="ml-6">
            <SignedIn>
              <SignOutButton>
                <button className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">
                  Sign Out
                </button>
              </SignOutButton>
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
