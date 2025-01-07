import React from "react";

const Notifications = ({ notifications }) => {
  return (
    <div className="bg-white border p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {notifications.length > 0 ? (
        <ul className="space-y-2">
          {notifications.map((notification, index) => (
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
