/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { MdError } from "react-icons/md";

interface FailedNotificationProps {
  message: string;
  onClose: () => void;
}

const FailedNotification: React.FC<FailedNotificationProps> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    // Play failure sound when the component mounts
    const sound = new Audio("/failed.wav");
    sound.play();
    // Auto-close after 10 seconds.
    const timer = setTimeout(() => {
      onClose();
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-5 z-50 right-5 p-4 bg-red-600 text-white flex items-center gap-2 rounded-lg shadow-lg">
      <MdError className="text-2xl" />
      <span>{message}</span>
      <button className="ml-2 text-white" onClick={onClose}>
        ✖
      </button>
    </div>
  );
};

export default FailedNotification;
