"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig"; // Firebase configuration
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, DocumentData } from "firebase/firestore";
import Refer from "./Refer";
import Rewards from "./Rewards";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [passwordMessage, setPasswordMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

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

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!user || !currentPassword || !newPassword) {
      setPasswordMessage("Please fill in all fields.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential); // Re-authenticate user
      await updatePassword(user, newPassword); // Update password
      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordMessage(
        "Failed to update password. Please check your current password and try again."
      );
    }
  };

  // Handle forgotten password
  const handleForgotPassword = async () => {
    if (!email) {
      setPasswordMessage("Please provide your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setPasswordMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setPasswordMessage(
        "Failed to send password reset email. Please try again."
      );
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

          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">Change Password</h4>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border-gray-300 rounded-lg w-full px-4 py-2 mb-4 bg-gray-100"
              placeholder="Current Password"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-gray-300 rounded-lg w-full px-4 py-2 mb-4 bg-gray-100"
              placeholder="New Password"
              required
            />
            <button
              onClick={handlePasswordUpdate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Update Password
            </button>
            <button
              onClick={handleForgotPassword}
              className="ml-2 text-blue-500 text-sm hover:underline"
            >
              Forgot Password?
            </button>

            {passwordMessage && (
              <p
                className={`mt-4 text-sm ${
                  passwordMessage.includes("successfully") ||
                  passwordMessage.includes("sent")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {passwordMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "refer" && <Refer />}
      {activeTab === "rewards" && <Rewards />}
    </div>
  );
};

export default Profile;
