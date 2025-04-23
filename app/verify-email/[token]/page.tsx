import { auth, db } from "../../firebaseConfig";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function VerifyEmailPage({
  params,
}: {
  params: { token: string };
}) {
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Decode the token (you might want to use a more secure method)
        const decodedToken = decodeURIComponent(params.token);
        const [uid, email] = decodedToken.split("|");

        // Verify the user in Firebase Authentication
        const user = auth.currentUser;
        if (user && !user.emailVerified) {
          await verifyBeforeUpdateEmail(user, email);
        }

        // Update the user document in Firestore
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, {
          verified: true,
        });

        // Redirect to dashboard or success page
        redirect("/dashboard");
      } catch (error) {
        console.error("Email verification failed:", error);
        redirect("/verification-failed");
      }
    };

    verifyEmail();
  }, [params.token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying Your Email</h1>
        <p className="text-gray-600 mb-6">
          Please wait while we verify your email address...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
}
