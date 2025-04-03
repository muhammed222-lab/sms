/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { Switch } from "@headlessui/react";
import { MdNotifications, MdEmail, MdPerson, MdDelete } from "react-icons/md";
import SuccessNotification from "../../components/sms_components/SuccessNotification";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";

interface Settings {
  currency: string; // active currency ("NGN" or "USD")
  delete_account: boolean;
  get_email_updates: boolean;
  make_me_extra_private: boolean;
  notification_sound: boolean;
  remove_all_history: boolean;
  user_email: string;
  username: string;
}

const SettingsComponent = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Subscribe to auth state and update userEmail dynamically.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch settings from Firestore once userEmail is available.
  useEffect(() => {
    if (!userEmail) return;
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", userEmail);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Settings;
        setSettings(data);
        setUsernameInput(data.username);
      } else {
        // Create default settings for new users
        const defaultSettings: Settings = {
          currency: "NGN",
          delete_account: false,
          get_email_updates: true,
          make_me_extra_private: true,
          notification_sound: true,
          remove_all_history: false,
          user_email: userEmail,
          username: "",
        };
        await setDoc(doc(db, "settings", userEmail), defaultSettings);
        setSettings(defaultSettings);
        setUsernameInput(defaultSettings.username);
      }
    };
    fetchSettings();
  }, [userEmail]);

  // Toggle boolean fields.
  const handleToggle = async (
    field: keyof Omit<Settings, "user_email" | "username" | "currency">
  ) => {
    if (settings) {
      const updatedValue = !settings[field];
      const newSettings = { ...settings, [field]: updatedValue };
      setSettings(newSettings);
      const docRef = doc(db, "settings", userEmail);
      await updateDoc(docRef, { [field]: updatedValue });
      setSuccessMessage(`${field.replace(/_/g, " ")} updated successfully!`);
    }
  };

  // Update currency selection.
  const handleCurrencyChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (settings) {
      const updatedCurrency = e.target.value;
      const newSettings = { ...settings, currency: updatedCurrency };
      setSettings(newSettings);
      const docRef = doc(db, "settings", userEmail);
      await updateDoc(docRef, { currency: updatedCurrency });
      setSuccessMessage("Currency updated successfully!");
    }
  };

  // Update username.
  const handleUsernameUpdate = async () => {
    if (settings) {
      const updatedUsername = usernameInput.trim();
      if (updatedUsername === "") {
        setSuccessMessage("Username cannot be empty");
        return;
      }
      const newSettings = { ...settings, username: updatedUsername };
      setSettings(newSettings);
      const docRef = doc(db, "settings", userEmail);
      await updateDoc(docRef, { username: updatedUsername });
      setSuccessMessage("Username updated successfully!");
    }
  };

  // Confirm and process account deletion.
  const handleConfirmDelete = async () => {
    // Dummy check: email must match logged in user and password should not be empty.
    if (deleteEmail !== userEmail || deletePassword.trim() === "") {
      setDeleteError("Credentials do not match.");
      return;
    }
    // Update delete_account in Firestore.
    const docRef = doc(db, "settings", userEmail);
    await updateDoc(docRef, { delete_account: true });
    setSuccessMessage("Account deletion successful!");
    // Redirect user to /login after deletion.
    router.push("/login");
  };

  // Confirm remove all history action.
  const handleConfirmRemoveHistory = async () => {
    const docRef = doc(db, "settings", userEmail);
    await updateDoc(docRef, { remove_all_history: true });
    setSuccessMessage("All history removed successfully!");
    setShowHistoryModal(false);
  };

  return (
    <>
      <Header />
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Settings</h2>
        {settings ? (
          <div className="space-y-6 bg-white p-6 rounded-lg border ">
            {/* Notification Sound */}
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex flex-row items-center gap-3">
                <MdNotifications className="text-xl text-green-500" />
                <span>Notification Sound</span>
              </div>
              <Switch
                checked={settings.notification_sound}
                onChange={() => handleToggle("notification_sound")}
                className={`${
                  settings.notification_sound ? "bg-green-600" : "bg-gray-400"
                } relative inline-flex items-center h-6 rounded-full w-11 transition`}
              >
                <span
                  className={`${
                    settings.notification_sound
                      ? "translate-x-6"
                      : "translate-x-1"
                  } inline-block w-4 h-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>

            {/* Email Updates */}
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex flex-row items-center gap-3">
                <MdEmail className="text-xl text-blue-500" />
                <span>Get Email Updates</span>
              </div>
              <Switch
                checked={settings.get_email_updates}
                onChange={() => handleToggle("get_email_updates")}
                className={`${
                  settings.get_email_updates ? "bg-blue-600" : "bg-gray-400"
                } relative inline-flex items-center h-6 rounded-full w-11 transition`}
              >
                <span
                  className={`${
                    settings.get_email_updates
                      ? "translate-x-6"
                      : "translate-x-1"
                  } inline-block w-4 h-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>

            {/* Make Me Extra Private */}
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex flex-row items-center gap-3">
                <MdPerson className="text-xl text-purple-500" />
                <span>Make Me Extra Private</span>
              </div>
              <Switch
                checked={settings.make_me_extra_private}
                onChange={() => handleToggle("make_me_extra_private")}
                className={`${
                  settings.make_me_extra_private
                    ? "bg-purple-600"
                    : "bg-gray-400"
                } relative inline-flex items-center h-6 rounded-full w-11 transition`}
              >
                <span
                  className={`${
                    settings.make_me_extra_private
                      ? "translate-x-6"
                      : "translate-x-1"
                  } inline-block w-4 h-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>

            {/* Currency Selector */}
            <div className="flex flex-row items-center justify-between gap-4">
              <span className="font-medium">Currency</span>
              <select
                value={settings.currency}
                onChange={handleCurrencyChange}
                className="p-2 border rounded"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <hr />

            {/* Username */}
            <div className="flex flex-row items-center justify-between gap-4">
              <span className="font-medium">Username</span>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="p-2 border rounded w-full sm:w-auto"
                  maxLength={15}
                />
                <button
                  onClick={handleUsernameUpdate}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Update Username
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <hr />
            <div className="flex flex-row items-center justify-between gap-4">
              <button
                onClick={() => setShowHistoryModal(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 w-full sm:w-auto"
              >
                Remove All History
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
              >
                Delete Account
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center">Loading settings...</p>
        )}

        {successMessage && (
          <SuccessNotification
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                Confirm Account Deletion
              </h3>
              <p className="mb-4">
                Please enter your email and password to confirm deletion.
              </p>
              <input
                type="email"
                placeholder="Email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                className="p-2 border rounded w-full mb-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="p-2 border rounded w-full mb-2"
              />
              {deleteError && (
                <p className="text-red-500 mb-2">{deleteError}</p>
              )}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remove All History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
              <h3 className="text-xl font-semibold mb-4">Remove All History</h3>
              <p className="mb-4">
                Are you sure you want to remove all your history? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemoveHistory}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsComponent;
