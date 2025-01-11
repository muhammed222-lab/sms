"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig"; // Firebase configuration
import { updateEmail, User } from "firebase/auth";
import { doc, getDoc, setDoc, DocumentData } from "firebase/firestore";
import Refer from "./Refer";
import Rewards from "./Rewards";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as DocumentData;
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setEmail(currentUser.email || "");
        }
      }
    };

    fetchUserData();
  }, []);

  // Update profile information
  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);

      // Update Firestore user data
      await setDoc(
        userDocRef,
        { firstName, lastName },
        { merge: true } // Merge with existing fields
      );

      // Update email if changed
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg max-w-xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-center">
        Account Settings
      </h3>

      {/* Tabs */}
      <div className="flex justify-center mb-4 border-b">
        <button
          className={`px-4 py-2 focus:outline-none ${
            activeTab === "profile"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`px-4 py-2 focus:outline-none ${
            activeTab === "refer"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("refer")}
        >
          Referral
        </button>
        <button
          className={`px-4 py-2 focus:outline-none ${
            activeTab === "rewards"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("rewards")}
        >
          Rewards
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div>
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Personal Information</h4>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border-gray-300 rounded-lg w-full px-4 py-2 mb-4 bg-gray-100"
              placeholder="First Name"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border-gray-300 rounded-lg w-full px-4 py-2 mb-4 bg-gray-100"
              placeholder="Last Name"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-gray-300 rounded-lg w-full px-4 py-2 mb-4 bg-gray-100"
              placeholder="Email Address"
              required
            />
            <button
              onClick={handleProfileUpdate}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update Profile
            </button>
          </div>

          {message && (
            <p
              className={`mt-4 text-sm ${
                message.includes("successfully")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-6 text-center">
            <img
              src={user?.photoURL || "https://www.gravatar.com/avatar?d=mp"} // Default profile image
              alt="User profile"
              className="rounded-full w-24 h-24 mx-auto"
            />
          </div>
        </div>
      )}

      {activeTab === "refer" && <Refer />}
      {activeTab === "rewards" && <Rewards />}
    </div>
  );
};

export default Profile;
