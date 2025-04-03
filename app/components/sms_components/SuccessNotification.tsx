/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    // Play notification sound if enabled
    const playNotificationSound = async () => {
      const currentUser = auth.currentUser;
      if (currentUser?.email) {
        const docRef = doc(db, "settings", currentUser.email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().notification_sound) {
          new Audio("/success.wav").play();
        }
      }
    };

    playNotificationSound();

    // Auto-hide after 3 seconds
    startAutoClose();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setMounted(false);
    };
  }, [onClose]);

  // Function to start auto-close timer
  const startAutoClose = () => {
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 3000);
  };

  // Pause timer when hovered
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // Resume timer when mouse leaves
  const handleMouseLeave = () => {
    startAutoClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed top-5 right-5 z-50 p-4 bg-green-600 text-white flex items-center gap-2 rounded-lg shadow-lg transition-opacity duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
