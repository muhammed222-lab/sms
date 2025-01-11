import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const addReferralCodeField = async () => {
  const usersCollectionRef = collection(db, "users");
  const usersSnapshot = await getDocs(usersCollectionRef);

  usersSnapshot.forEach(async (userDoc) => {
    const userData = userDoc.data();

    if (!userData.referral_code) {
      const userDocRef = doc(db, "users", userDoc.id);
      await updateDoc(userDocRef, {
        referral_code: "", // Empty field
      });
      console.log(`Added referral_code field to user ${userDoc.id}`);
    }
  });
};

addReferralCodeField()
  .then(() => console.log("Finished updating users"))
  .catch((error) => console.error("Error updating users:", error));
