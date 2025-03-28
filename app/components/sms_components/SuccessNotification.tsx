import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdCheckCircle } from "react-icons/md";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface SuccessNotificationProps {
  message: string;
  onClose: () => void;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  message,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [topOffset, setTopOffset] = useState(window.scrollY + 10);

  useEffect(() => {
    setMounted(true);

    // Check current user's settings before playing sound.
    const playNotificationSound = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        const docRef = doc(db, "settings", currentUser.email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const settingsData = docSnap.data() as {
            notification_sound: boolean;
          };
          if (settingsData.notification_sound) {
            const sound = new Audio("/success.wav");
            sound.play();
          }
        }
      }
    };

    playNotificationSound();

    // Adjust top position dynamically on scroll.
    const handleScroll = () => {
      setTopOffset(window.scrollY + 10);
    };

    window.addEventListener("scroll", handleScroll);
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Hide after 10 seconds

    return () => {
      clearTimeout(timer);
      setMounted(false);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed right-5 z-50 p-4 bg-green-600 text-white flex items-center gap-2 rounded-lg shadow-lg"
      style={{ top: `${topOffset}px` }}
    >
      <MdCheckCircle className="text-2xl" />
      <span>{message}</span>
      <button className="ml-2 text-white" onClick={onClose}>
        ✖
      </button>
    </div>,
    document.body
  );
};

export default SuccessNotification;
