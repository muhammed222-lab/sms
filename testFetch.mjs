import { Clerk } from "@clerk/express"; // Correct named import

// Other imports
import admin from "firebase-admin";
import serviceAccount from "./deemax-3223e-firebase-adminsdk-qg4o1-0164be71ab.json" assert { type: "json" };

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Firestore reference
const db = admin.firestore();

// Initialize Clerk Express SDK with your Clerk API Key
const clerk = new Clerk({
  apiKey: "sk_test_YzasKF2zrvbzj4Q0DqsF2UP70X2THaxO36Rc9trYNr",
});

// Function to fetch user data from Firestore and compare email
const fetchUserData = async (userEmail) => {
  try {
    const userDoc = await db
      .collection("userDeposits")
      .doc(userEmail) // Use the user email as document ID
      .get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("Email Matched:", userEmail);
      console.log("User Data:", userData);

      if (userData?.amount) {
        console.log("User Amount:", userData.amount);
      } else {
        console.log("Amount not found for this user");
      }
    } else {
      console.log("No such document found!");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

// Fetch user from Clerk and compare
const fetchClerkUserAndCompare = async (clerkUserId) => {
  try {
    const clerkUser = await clerk.users.getUser(clerkUserId); // Fetch the Clerk user

    if (clerkUser && clerkUser.emailAddresses?.[0]?.emailAddress) {
      const clerkEmail = clerkUser.emailAddresses[0].emailAddress;
      console.log("Clerk User Email:", clerkEmail);

      // Fetch user data from Firebase and compare email
      await fetchUserData(clerkEmail);
    } else {
      console.log("No user found in Clerk.");
    }
  } catch (error) {
    console.error("Error fetching Clerk user:", error);
  }
};

// Replace with the actual Clerk user ID
const clerkUserId = "user_2qQS3dZshUhSxfQHDib7XLyJ2ox"; // Example: 'user_12345'

// Call the function to fetch Clerk user and compare with Firebase data
fetchClerkUserAndCompare(clerkUserId);
