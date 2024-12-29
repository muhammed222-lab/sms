import React, { useState } from "react";
import { useClerk } from "@clerk/nextjs"; // Clerk for user data
import { db } from "../firebaseConfig"; // Import Firestore
import { collection, addDoc } from "firebase/firestore"; // Firestore methods

const Feedback = () => {
  const { user } = useClerk(); // Access user data from Clerk
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Capture the current timestamp
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });

    // Check if user is logged in
    if (!user) {
      setMessage("Please log in to submit feedback.");
      return;
    }

    // Extract user details
    const userEmail =
      user.emailAddresses && user.emailAddresses.length > 0
        ? user.emailAddresses[0]?.emailAddress
        : "Unknown Email";
    const userName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : "Anonymous";

    const feedbackData = {
      feedback,
      user_email: userEmail,
      user_name: userName,
      date: formattedDate,
    };

    try {
      // Save feedback to Firestore
      const feedbackCollection = collection(db, "feedbacks");
      await addDoc(feedbackCollection, feedbackData);

      // Clear the form and show a success message
      setFeedback("");
      setMessage("Thank you for your feedback!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setMessage("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>
      <p className="text-gray-700 mb-6">
        We would love to hear your thoughts and suggestions!
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          rows={4}
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Submit Feedback
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
};

export default Feedback;
