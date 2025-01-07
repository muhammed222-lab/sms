import React from "react";

interface Notification {
  title: string;
  message: string;
  date: string;
}

interface NotificationsProps {
  notifications?: Notification[]; // Notifications are optional for flexibility
}

const Notifications: React.FC<NotificationsProps> = ({
  notifications = [],
}) => {
  // Static notifications
  const staticNotifications: Notification[] = [
    {
      title: "Welcome to Smsglobe!",
      message: "Thank you for joining us! We are excited to have you onboard.",
      date: new Date().toISOString(),
    },
    {
      title: "Get Started with Our Services",
      message:
        "Start using our temporary phone numbers for seamless verifications.",
      date: new Date().toISOString(),
    },
    {
      title: "Need Help?",
      message:
        "Check out our FAQ section or contact support for any assistance.",
      date: new Date().toISOString(),
    },
  ];

  const allNotifications = [...staticNotifications, ...notifications];

  return (
    <div className="bg-white border p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {allNotifications.length > 0 ? (
        <ul className="space-y-2">
          {allNotifications.map((notification, index) => (
            <li
              key={index}
              className="p-3 border rounded bg-gray-50 hover:bg-gray-100 transition"
            >
              <p className="font-medium text-gray-800">{notification.title}</p>
              <p className="text-sm text-gray-600">{notification.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(notification.date).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No notifications available.</p>
      )}
    </div>
  );
};

export default Notifications;
