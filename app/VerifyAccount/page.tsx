"use client";
import React, { useEffect, useState } from "react";
import { sendEmailVerification, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../firebaseConfig";

const VerifyAccount: React.FC = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: User | null) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailSent && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emailSent, resendTimer]);

  const handleSendVerificationEmail = async () => {
    if (user) {
      try {
        setLoading(true);
        setError(null);
        await sendEmailVerification(user);
        setEmailSent(true);
        setLoading(false);
        setResendTimer(20);
      } catch (err: unknown) {
        console.error("Error sending verification email:", err);
        setLoading(false);
        const errorObj = err as { code?: string };
        if (errorObj.code === "auth/too-many-requests") {
          setError("Too many requests. Please try again later.");
        } else {
          setError("Error sending verification email. Please try again.");
        }
      }
    }
  };

  const handleCheckVerificationStatus = async () => {
    if (user) {
      try {
        setLoading(true);
        await user.reload();
        if (user.emailVerified) {
          router.push("/dashboard");
        } else {
          alert("Email not verified yet. Please check your email.");
        }
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error checking verification status:", err);
        setLoading(false);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Verify Your Email</h1>
        {user && (
          <div>
            <p style={{ textAlign: "center" }}>
              Your email: <strong>{user.email}</strong>
            </p>
            {!emailSent ? (
              <button
                onClick={handleSendVerificationEmail}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  width: "100%",
                  marginTop: "10px",
                }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Verification Email"}
              </button>
            ) : (
              <div style={{ textAlign: "center" }}>
                <p>Verification email sent. Please check your email.</p>
                <button
                  onClick={handleCheckVerificationStatus}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    cursor: "pointer",
                    borderRadius: "5px",
                    width: "100%",
                    marginTop: "10px",
                  }}
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Check Verification Status"}
                </button>
                {resendTimer === 0 ? (
                  <p style={{ marginTop: "10px" }}>
                    Didn&apos;t receive the email?{" "}
                    <button
                      onClick={handleSendVerificationEmail}
                      style={{
                        backgroundColor: "transparent",
                        color: "#4CAF50",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Resend
                    </button>
                  </p>
                ) : (
                  <p style={{ marginTop: "10px" }}>
                    Resend email in {resendTimer} seconds
                  </p>
                )}
              </div>
            )}
            {error && (
              <p style={{ color: "red", textAlign: "center" }}>{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
