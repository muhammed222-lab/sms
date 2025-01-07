"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import React, { useState } from "react";

const Profile = () => {
  const { user } = useUser(); // Get user info from Clerk
  const { signOut } = useClerk(); // Handle user sign out
  const [isEditing, setIsEditing] = useState(false);
  const [updatedEmail, setUpdatedEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || ""
  );

  // Handle email update
  const handleEmailUpdate = () => {
    // Add logic here to update the email using Clerk's API
    alert(`Email updated to: ${updatedEmail}`);
    // Reset editing state after update
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl m-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Your Profile
      </h2>

      {/* Display user info */}
      <div className="mb-4">
        <strong>Name:</strong>{" "}
        <span>
          {user?.firstName} {user?.lastName}
        </span>
      </div>
      <div className="mb-4">
        <strong>Email:</strong>{" "}
        {isEditing ? (
          <input
            type="email"
            value={updatedEmail}
            onChange={(e) => setUpdatedEmail(e.target.value)}
            className="border border-gray-300 p-2 rounded-md"
          />
        ) : (
          <span>{user?.primaryEmailAddress?.emailAddress}</span>
        )}
      </div>

      {/* Edit email or save */}
      <div className="flex space-x-4">
        {isEditing ? (
          <>
            <button
              onClick={handleEmailUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md"
          >
            Edit Email
          </button>
        )}
      </div>

      {/* Sign Out Button */}
      <div className="mt-6">
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
