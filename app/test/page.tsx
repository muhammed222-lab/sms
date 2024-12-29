/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useClerk } from "@clerk/nextjs"; // Clerk integration for React/Next.js
import { useEffect, useState } from "react";

// Page Component
const TestPage = () => {
  const { user } = useClerk(); // Clerk context hook should be inside the component
  const [status, setStatus] = useState<string>(""); // State for status message

  // Fetch Clerk user and compare with Firestore (via API route)
  const fetchClerkUserAndCompare = async (clerkUserId: string) => {
    try {
      // Fetch the Clerk user
      const clerkUser = user;
      console.log("Clerk User:", clerkUser); // Log Clerk User for debugging

      if (clerkUser && clerkUser.emailAddresses?.[0]?.emailAddress) {
        const clerkEmail = clerkUser.emailAddresses[0].emailAddress;
        console.log("Clerk User Email:", clerkEmail); // Log email for debugging

        // Call API route to fetch user data based on email
        const response = await fetch(`/api/fetchUserData?email=${clerkEmail}`);
        const data = await response.json();
        console.log("API Response Data:", data); // Log API response for debugging

        if (response.ok && data?.balance) {
          setStatus(`Balance: ${data.balance}`); // Set balance to state and display on page
          // status(`Balance: ${data.balance}`); // Set balance to state and display on page
        } else {
          setStatus("Error fetching data");
          // status("Error fetching data");
        }
      } else {
        setStatus("No user found in Clerk");
        // status("No user found in Clerk");
      }
    } catch (error) {
      setStatus("Error fetching Clerk user");
      // status("Error fetching Clerk user");
    }
    return (
      <div>
        <h1>Test Page</h1>
        <p>{status}</p>
      </div>
    );
  };

  useEffect(() => {
    const clerkUserId = "user_2qQS3dZshUhSxfQHDib7XLyJ2ox"; // Example Clerk user ID
    if (user) {
      fetchClerkUserAndCompare(clerkUserId);
    }
  }, [user]);
};

// Wrap the page with ClerkProvider
const PageWrapper = () => <></>;

export default PageWrapper;
