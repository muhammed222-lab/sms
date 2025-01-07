"use client";
import { useEffect, useState } from "react";
import { ClerkProvider, useClerk } from "@clerk/nextjs"; // Clerk integration for React/Next.js

// Page Component
const TestPage = () => {
  const [status, setStatus] = useState<string>("");
  const { clerk } = useClerk(); // Clerk context hook should be inside the component

  // Fetch Clerk user and compare with Firestore (via API route)
  const fetchClerkUserAndCompare = async (clerkUserId: string) => {
    try {
      // Fetch the Clerk user
      const clerkUser = await clerk.users.getUser(clerkUserId);
      console.log("Clerk User:", clerkUser); // Log Clerk User for debugging

      if (clerkUser && clerkUser.emailAddresses?.[0]?.emailAddress) {
        const clerkEmail = clerkUser.emailAddresses[0].emailAddress;
        console.log("Clerk User Email:", clerkEmail); // Log email for debugging

        // Call API route to fetch user data based on email
        const response = await fetch(`/api/fetchUserData?email=${clerkEmail}`);
        const data = await response.json();
        console.log("API Response Data:", data); // Log API response for debugging

        if (response.ok && data?.balance) {
          console.log("User Data:", data);
          setStatus(`Balance: ${data.balance}`); // Set balance to state and display on page
        } else {
          console.error("Error fetching user data:", data);
          setStatus("Error fetching data");
        }
      } else {
        console.log("No email found in Clerk User.");
        setStatus("No user found in Clerk");
      }
    } catch (error) {
      console.error("Error fetching Clerk user:", error);
      setStatus("Error fetching Clerk user");
    }
  };

  useEffect(() => {
    const clerkUserId = "user_2qQS3dZshUhSxfQHDib7XLyJ2ox"; // Example Clerk user ID
    if (clerk) {
      fetchClerkUserAndCompare(clerkUserId);
    }
  }, [clerk]);
};

// Wrap the page with ClerkProvider
const PageWrapper = () => <ClerkProvider></ClerkProvider>;

export default PageWrapper;
