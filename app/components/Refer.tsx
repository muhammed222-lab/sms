"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { assignReferralCode } from "../utils/referralUtils"; // Import your utility

const Refer: React.FC = () => {
  const [referralLink, setReferralLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndAssignReferralCode = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            let referralCode = userDoc.data()?.referral_code;

            // If "referral_code" field exists but is empty, generate a new code
            if (referralCode === undefined) {
              referralCode = await assignReferralCode(currentUser.uid); // Generate and save the code
            } else if (!referralCode) {
              await updateDoc(userDocRef, {
                referral_code: await assignReferralCode(currentUser.uid), // Generate a new code and save
              });
              referralCode = (await getDoc(userDocRef)).data()?.referral_code;
            }

            // Set the referral link
            if (referralCode) {
              const domain =
                process.env.NODE_ENV === "development"
                  ? "http://localhost:3000"
                  : "https://www.smsglobe.net";
              setReferralLink(`${domain}/invite/${referralCode}`);
            }
          }
        } catch (error) {
          console.error("Error fetching or assigning referral code:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAndAssignReferralCode();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Referral</h3>
      <p className="text-gray-600 mb-4">
        Share your referral link with your friends to earn rewards!
      </p>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm mb-2">Your Referral Link:</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {loading ? "Loading..." : referralLink}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(referralLink)}
            className="text-blue-500 text-sm"
            disabled={!referralLink}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Refer;
