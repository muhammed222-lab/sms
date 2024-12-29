"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
const Profile = () => {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.emailAddresses[0]?.emailAddress || "");
    }
  }, [isLoaded, user]);

  const handleProfileUpdate = async () => {
    try {
      // Update first name and last name
      await user?.update({
        firstName: firstName,
        lastName: lastName,
      });

      // Update email address
      if (email !== user?.emailAddresses[0]?.emailAddress) {
        await user?.createEmailAddress({ email: email });
      }

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation do not match.");
      return;
    }

    try {
      await user?.updatePassword({
        newPassword,
      });

      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg max-w-xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Profile</h3>

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
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Update Profile
        </button>
      </div>

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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border-gray-300 rounded-lg w-full px-4 py-2 mb-4 bg-gray-100"
          placeholder="Confirm New Password"
          required
        />
        <button
          onClick={handlePasswordChange}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Update Password
        </button>
      </div>

      {message && <p className="mt-4 text-sm">{message}</p>}

      <div className="mt-6">
        <Image
          src={user?.imageUrl || "https://www.gravatar.com/avatar?d=mp"}
          alt="User profile"
          className="rounded-full w-24 h-24 mb-4"
        />
      </div>
    </div>
  );
};

export default Profile;
