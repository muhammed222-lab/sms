/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";
import { FiX, FiAlertCircle, FiMail } from "react-icons/fi";

const Auth: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const email = currentUser.email || "default@example.com";
          const q = query(collection(db, "users"), where("email", "==", email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data() as DocumentData;
            setIsVerified(userData.verified);
            // Reset visibility when verification status changes
            if (!userData.verified) {
              setIsVisible(true);
              localStorage.removeItem("notificationHiddenAt");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    // Check if notification was recently hidden
    const hiddenAt = localStorage.getItem("notificationHiddenAt");
    if (hiddenAt) {
      const hideTime = parseInt(hiddenAt, 10);
      const currentTime = Date.now();
      const timeElapsed = currentTime - hideTime;
      const reappearAfter = 30 * 60 * 1000; // 30 minutes in milliseconds

      if (timeElapsed < reappearAfter) {
        setIsVisible(false);
        const remainingTime = reappearAfter - timeElapsed;
        const timer = setTimeout(() => {
          setIsVisible(true);
          localStorage.removeItem("notificationHiddenAt");
        }, remainingTime);

        // Start countdown for UI
        const countdownInterval = setInterval(() => {
          setCountdown(
            Math.ceil((remainingTime - (Date.now() - currentTime)) / 60000)
          );
        }, 60000);

        return () => {
          clearTimeout(timer);
          clearInterval(countdownInterval);
        };
      } else {
        localStorage.removeItem("notificationHiddenAt");
      }
    }

    return () => unsubscribe();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("notificationHiddenAt", Date.now().toString());

    // Set timeout to reappear after 30 minutes
    setTimeout(() => {
      setIsVisible(true);
      localStorage.removeItem("notificationHiddenAt");
    }, 30 * 60 * 1000); // 30 minutes

    // Initialize countdown
    setCountdown(30);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
  };

  if (!isVerified && user && isVisible) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="text-white text-xl" />
            <div>
              <p className="font-medium">
                Your email <strong className="font-bold">{user.email}</strong>{" "}
                has not been verified yet.
              </p>
              <p className="text-sm opacity-90">
                Please{" "}
                <Link
                  href="/VerifyAccount"
                  className="underline font-semibold hover:text-yellow-200 transition"
                >
                  verify it now
                </Link>
                , or your account will be restricted temporarily.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {countdown && (
              <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                Shows again in {countdown} min
              </span>
            )}
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
              aria-label="Dismiss notification"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Auth;
