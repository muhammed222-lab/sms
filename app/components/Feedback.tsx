/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { UAParser } from "ua-parser-js";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  FiSend,
  FiSmile,
  FiFrown,
  FiMeh,
  FiStar,
  FiCheckCircle,
  FiUser,
  FiEyeOff,
} from "react-icons/fi";
import { motion } from "framer-motion";

type FeedbackType = "bug" | "suggestion" | "compliment" | "question";
type Sentiment = "positive" | "neutral" | "negative";

interface FeedbackData {
  message: string;
  user_email: string;
  user_name: string;
  user_id: string;
  type: FeedbackType;
  sentiment: Sentiment;
  rating: number;
  metadata: {
    browser: string;
    os: string;
    url: string;
    screen_resolution: string;
  };
  createdAt: any;
  status?: "new" | "reviewed" | "in-progress" | "resolved";
  isAnonymous?: boolean;
}

const Feedback = () => {
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("suggestion");
  const [sentiment, setSentiment] = useState<Sentiment>("neutral");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userFeedbacks, setUserFeedbacks] = useState<FeedbackData[]>([]);
  const [showUserFeedbacks, setShowUserFeedbacks] = useState(false);

  // Get user agent info
  const [userAgent, setUserAgent] = useState({
    browser: "",
    os: "",
    screen_resolution: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserFeedbacks(currentUser.uid);
      }
    });

    // Get user agent info
    const parser = new UAParser();
    const result = parser.getResult();
    setUserAgent({
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
    });

    return () => unsubscribe();
  }, []);

  const fetchUserFeedbacks = async (userId: string) => {
    try {
      const feedbacksQuery = query(
        collection(db, "feedbacks"),
        where("user_id", "==", userId),
        where("isAnonymous", "==", false)
      );
      const querySnapshot = await getDocs(feedbacksQuery);
      const feedbacks = querySnapshot.docs.map(
        (doc) => doc.data() as FeedbackData
      );
      setUserFeedbacks(feedbacks);
    } catch (error) {
      console.error("Error fetching user feedbacks:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      setMessage("Please log in to submit feedback.");
      setIsSubmitting(false);
      return;
    }

    const feedbackData: FeedbackData = {
      message: feedback,
      user_email: isAnonymous ? "Anonymous" : user.email || "Unknown Email",
      user_name: isAnonymous ? "Anonymous" : user.displayName || "Anonymous",
      user_id: isAnonymous ? "anonymous" : user.uid,
      type: feedbackType,
      sentiment,
      rating,
      metadata: {
        ...userAgent,
        url: window.location.href,
      },
      createdAt: serverTimestamp(),
      status: "new",
      isAnonymous,
    };

    try {
      const feedbackCollection = collection(db, "feedbacks");
      await addDoc(feedbackCollection, feedbackData);

      setFeedback("");
      setRating(0);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      if (!isAnonymous) {
        fetchUserFeedbacks(user.uid);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setMessage("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = () => (
    <div className="flex items-center mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="text-2xl focus:outline-none"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          {star <= (hoverRating || rating) ? (
            <FiStar className="text-yellow-400 fill-current" />
          ) : (
            <FiStar className="text-gray-300" />
          )}
        </button>
      ))}
      <span className="ml-2 text-gray-600">
        {rating > 0
          ? `${rating} star${rating !== 1 ? "s" : ""}`
          : "Rate your experience"}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-xl border"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Share Your Thoughts
      </h1>
      <p className="text-gray-600 mb-6">
        We value your feedback! Help us improve by sharing your experience.
      </p>

      {showSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 mb-6 bg-green-50 text-green-700 rounded-lg flex items-center"
        >
          <FiCheckCircle className="mr-2" size={20} />
          Thank you! Your feedback has been submitted successfully.
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type Selector */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">This is a:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: "suggestion", label: "Suggestion" },
                { value: "bug", label: "Bug Report" },
                { value: "compliment", label: "Compliment" },
                { value: "question", label: "Question" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    feedbackType === type.value
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => setFeedbackType(type.value as FeedbackType)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sentiment Selector */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your sentiment:</label>
            <div className="flex space-x-3">
              <button
                type="button"
                className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                  sentiment === "positive"
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => setSentiment("positive")}
              >
                <FiSmile className="mr-2" />
                Positive
              </button>
              <button
                type="button"
                className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                  sentiment === "neutral"
                    ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => setSentiment("neutral")}
              >
                <FiMeh className="mr-2" />
                Neutral
              </button>
              <button
                type="button"
                className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                  sentiment === "negative"
                    ? "bg-red-100 border-red-500 text-red-700"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => setSentiment("negative")}
              >
                <FiFrown className="mr-2" />
                Negative
              </button>
            </div>
          </div>

          {/* Star Rating */}
          <StarRating />

          {/* Feedback Text Area */}
          <div className="mb-4">
            <label htmlFor="feedback" className="block text-gray-700 mb-2">
              Your feedback:
            </label>
            <textarea
              id="feedback"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              rows={5}
              placeholder={`Tell us about your ${
                feedbackType === "bug"
                  ? "bug..."
                  : feedbackType === "suggestion"
                  ? "suggestion..."
                  : feedbackType === "compliment"
                  ? "compliment..."
                  : "question..."
              }`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !feedback}
              className={`px-6 py-3 rounded-lg flex items-center transition ${
                isSubmitting || !feedback
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSubmitting ? (
                <>
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
                  Submitting...
                </>
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Send Feedback
                </>
              )}
            </button>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {message}
            </div>
          )}
        </form>
      )}

      {/* User info and anonymous toggle */}
      {user && (
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Submitting as:{" "}
              <span className="text-gray-700">
                {isAnonymous ? "Anonymous" : user.email || "Anonymous"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`flex items-center px-3 py-1 rounded-full text-sm ${
                isAnonymous
                  ? "bg-gray-100 text-gray-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isAnonymous ? (
                <>
                  <FiEyeOff className="mr-1" size={14} />
                  Anonymous
                </>
              ) : (
                <>
                  <FiUser className="mr-1" size={14} />
                  Public
                </>
              )}
            </button>
          </div>

          {!isAnonymous && userFeedbacks.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowUserFeedbacks(!showUserFeedbacks)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showUserFeedbacks ? "Hide" : "Show"} my previous feedbacks (
                {userFeedbacks.length})
              </button>

              {showUserFeedbacks && (
                <div className="mt-2 space-y-3">
                  {userFeedbacks.map((fb, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium capitalize">
                            {fb.type}
                          </span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-500">
                            {new Date(
                              fb.createdAt?.toDate() || new Date()
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {Array(fb.rating)
                            .fill(0)
                            .map((_, i) => (
                              <FiStar
                                key={i}
                                className="text-yellow-400 fill-current text-sm"
                              />
                            ))}
                        </div>
                      </div>
                      <p className="mt-1 text-gray-700">{fb.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Feedback;
