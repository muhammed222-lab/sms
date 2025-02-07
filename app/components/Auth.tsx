import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";

const Auth: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const email = currentUser.email || "default@example.com";
          const q = query(collection(db, "users"), where("email", "==", email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data() as DocumentData;
            setIsVerified(userData.verified);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {!isVerified && user && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#cc3300",
            color: "white",
            padding: "10px",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          <p>
            Your email <strong>{user.email}</strong> has not been verified yet.
            Please <Link href={"/VerifyAccount"}> verify it now</Link>, or your
            account will be restricted temporarily till you do so.
          </p>
          <button
            onClick={() => setIsVerified(true)}
            style={{
              backgroundColor: "white",
              color: "red",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;
