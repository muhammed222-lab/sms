import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const generateReferralCode = (length = 8): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const assignReferralCode = async (userId: string): Promise<string> => {
  const referralCode = generateReferralCode();
  const userDocRef = doc(db, "users", userId);

  await updateDoc(userDocRef, {
    referral_code: referralCode,
  });

  return referralCode;
};
