"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
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
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiGift, FiShare2 } from "react-icons/fi";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [passwordMessage, setPasswordMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update profile information
  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const userDocRef = doc(db, "users", user.uid);

      // Update Firestore user data
      await setDoc(userDocRef, { firstName, lastName }, { merge: true });

      // Update email if changed
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!user || !currentPassword || !newPassword) {
      setPasswordMessage("Please fill in all fields.");
      return;
    }
    setIsLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordFields(false);
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordMessage(
        "Failed to update password. Please check your current password and try again."
      );
    } finally {
      setIsLoading(false);
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
      setTimeout(() => setPasswordMessage(""), 5000);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setPasswordMessage(
        "Failed to send password reset email. Please try again."
      );
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-800">Account Settings</h3>
        {user && (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <span className="ml-3 font-medium text-gray-700">
              {firstName || "User"}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-between mb-8 border-b border-gray-200">
        <button
          className={`px-6 py-3 focus:outline-none relative ${
            activeTab === "profile"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <div className="flex items-center">
            <FiUser className="mr-2" />
            Profile
          </div>
          {activeTab === "profile" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t"
              layoutId="underline"
            />
          )}
        </button>
        <button
          className={`px-6 py-3 focus:outline-none relative ${
            activeTab === "refer"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("refer")}
        >
          <div className="flex items-center">
            <FiShare2 className="mr-2" />
            Referral
          </div>
          {activeTab === "refer" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t"
              layoutId="underline"
            />
          )}
        </button>
        <button
          className={`px-6 py-3 focus:outline-none relative ${
            activeTab === "rewards"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("rewards")}
        >
          <div className="flex items-center">
            <FiGift className="mr-2" />
            Overview
          </div>
          {activeTab === "rewards" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t"
              layoutId="underline"
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial="hidden"
        animate="visible"
        variants={tabVariants}
        transition={{ duration: 0.3 }}
        className="min-h-[400px]"
      >
        {activeTab === "profile" && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <FiUser className="mr-2 text-blue-500" />
                Personal Information
              </h4>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Email Address"
                  />
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex justify-center items-center"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                Update Profile
              </button>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-lg text-center ${
                    message.includes("successfully")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <FiLock className="mr-2 text-blue-500" />
                Password Settings
              </h4>

              {!showPasswordFields ? (
                <button
                  onClick={() => setShowPasswordFields(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg transition"
                >
                  Change Password
                </button>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Current Password"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="New Password"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex justify-center items-center"
                    >
                      {isLoading ? (
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : null}
                      Update Password
                    </button>

                    <button
                      onClick={() => {
                        setShowPasswordFields(false);
                        setCurrentPassword("");
                        setNewPassword("");
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>

                  <button
                    onClick={handleForgotPassword}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition"
                  >
                    Forgot Password?
                  </button>

                  {passwordMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-3 rounded-lg text-center ${
                        passwordMessage.includes("successfully") ||
                        passwordMessage.includes("sent")
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {passwordMessage}
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "refer" && <Refer />}
        {activeTab === "rewards" && <Rewards />}
      </motion.div>
    </div>
  );
};

export default Profile;
