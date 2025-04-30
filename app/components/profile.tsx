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
    <div className="min-h-screen  py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Account Settings
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Manage your profile and Referral settings
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          {/* Profile Header */}
          <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {firstName || "User"} {lastName}
                </h2>
                <p className="text-gray-500">{email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiUser className="h-5 w-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("refer")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "refer"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiShare2 className="h-5 w-5" />
                <span>Referral</span>
              </button>
              <button
                onClick={() => setActiveTab("rewards")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "rewards"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiGift className="h-5 w-5" />
                <span>Overview</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-4">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "profile" && (
                <div className="space-y-8">
                  {/* Personal Information Card */}
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FiUser className="mr-2 text-blue-500" />
                        Personal Information
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Update your basic profile details
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                          placeholder="First Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                          placeholder="Email Address"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleProfileUpdate}
                        disabled={isLoading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center min-w-[120px]"
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            Updating...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>

                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-3 rounded-lg ${
                          message.includes("successfully")
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {message}
                      </motion.div>
                    )}
                  </div>

                  {/* Password Settings Card */}
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FiLock className="mr-2 text-blue-500" />
                        Password Settings
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Change your password or reset it if forgotten
                      </p>
                    </div>

                    {!showPasswordFields ? (
                      <button
                        onClick={() => setShowPasswordFields(true)}
                        className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition flex items-center justify-center"
                      >
                        <FiLock className="mr-2" />
                        Change Password
                      </button>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="text-gray-400" />
                              </div>
                              <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                  setCurrentPassword(e.target.value)
                                }
                                className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                                placeholder="Current Password"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                                placeholder="New Password"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                          <button
                            onClick={handlePasswordUpdate}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition flex items-center justify-center"
                          >
                            {isLoading ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                Updating...
                              </>
                            ) : (
                              "Update Password"
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setShowPasswordFields(false);
                              setCurrentPassword("");
                              setNewPassword("");
                            }}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>

                        <button
                          onClick={handleForgotPassword}
                          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition"
                        >
                          Forgot Password?
                        </button>

                        {passwordMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-4 p-3 rounded-lg ${
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
