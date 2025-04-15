"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Switch } from "@headlessui/react";
import {
  MdNotifications,
  MdEmail,
  MdPerson,
  MdDelete,
  MdHistory,
  MdLanguage,
  MdSecurity,
  MdHelp,
  MdInfo,
  MdInstallMobile,
  MdAccountCircle,
  MdPayment,
} from "react-icons/md";
import SuccessNotification from "../components/sms_components/SuccessNotification";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FiMoon, FiSun } from "react-icons/fi";

interface Settings {
  currency: string;
  delete_account: boolean;
  get_email_updates: boolean;
  make_me_extra_private: boolean;
  notification_sound: boolean;
  remove_all_history: boolean;
  user_email: string;
  username: string;
  lght_mode: boolean;
  two_factor_auth: boolean;
  language: string;
  auto_lock: boolean;
}

const SettingsComponent = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Check for PWA install capability
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Handle PWA installation
  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch settings
  useEffect(() => {
    if (!userEmail) return;

    const fetchSettings = async () => {
      const docRef = doc(db, "settings", userEmail);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Settings;
        setSettings(data);
        setUsernameInput(data.username || "");
      } else {
        const defaultSettings: Settings = {
          currency: "USD",
          delete_account: false,
          get_email_updates: true,
          make_me_extra_private: false,
          notification_sound: true,
          remove_all_history: false,
          user_email: userEmail,
          username: "",
          lght_mode: false,
          two_factor_auth: false,
          language: "en",
          auto_lock: false,
        };
        await setDoc(doc(db, "settings", userEmail), defaultSettings);
        setSettings(defaultSettings);
        setUsernameInput("");
      }
    };

    fetchSettings();
  }, [userEmail]);

  // Toggle settings
  const handleToggle = async (field: keyof Settings) => {
    if (settings) {
      const updatedValue = !settings[field];
      const newSettings = { ...settings, [field]: updatedValue };
      setSettings(newSettings);

      // Apply Light more (Coming soon) class if toggling Light more (Coming soon)
      if (field === "lght_mode") {
        if (updatedValue) {
          document.documentElement.classList.add("lght");
        } else {
          document.documentElement.classList.remove("lght");
        }
      }

      const docRef = doc(db, "settings", userEmail);
      await updateDoc(docRef, { [field]: updatedValue });
      setSuccessMessage(`${field.replace(/_/g, " ")} updated successfully!`);
    }
  };

  // Update select fields
  const handleSelectChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    field: keyof Settings
  ) => {
    if (settings) {
      const updatedValue = e.target.value;
      const newSettings = { ...settings, [field]: updatedValue };
      setSettings(newSettings);
      const docRef = doc(db, "settings", userEmail);
      await updateDoc(docRef, { [field]: updatedValue });
      setSuccessMessage(`${field.replace(/_/g, " ")} updated successfully!`);
    }
  };

  // Update username
  const handleUsernameUpdate = async () => {
    if (settings && usernameInput.trim()) {
      const newSettings = { ...settings, username: usernameInput.trim() };
      setSettings(newSettings);
      const docRef = doc(db, "settings", userEmail);
      await updateDoc(docRef, { username: usernameInput.trim() });
      setSuccessMessage("Username updated successfully!");
    }
  };

  // Account deletion
  const handleConfirmDelete = async () => {
    if (deleteEmail !== userEmail || deletePassword.trim() === "") {
      setDeleteError("Credentials do not match.");
      return;
    }
    const docRef = doc(db, "settings", userEmail);
    await updateDoc(docRef, { delete_account: true });
    setSuccessMessage("Account deletion successful!");
    router.push("/login");
  };

  // Remove history
  const handleConfirmRemoveHistory = async () => {
    const docRef = doc(db, "settings", userEmail);
    await updateDoc(docRef, { remove_all_history: true });
    setSuccessMessage("All history removed successfully!");
    setShowHistoryModal(false);
  };

  if (!settings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white lght:bg-gray-800 rounded-xl border p-4 sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800 lght:text-white">
                Settings
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 lght:hover:bg-gray-700 text-gray-700 lght:text-gray-300"
                >
                  <MdAccountCircle className="text-xl" />
                  <span>Profile</span>
                </button>
                <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-blue-50 lght:bg-blue-900/30 text-blue-600 lght:text-blue-400">
                  <MdSecurity className="text-xl" />
                  <span>Security</span>
                </button>
                <button
                  onClick={() => router.push("/deposit`")}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 lght:hover:bg-gray-700 text-gray-700 lght:text-gray-300"
                >
                  <MdPayment className="text-xl" />
                  <span>Payments</span>
                </button>
                <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 lght:hover:bg-gray-700 text-gray-700 lght:text-gray-300">
                  <MdLanguage className="text-xl" />
                  <span>Language</span>
                </button>
                <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 lght:hover:bg-gray-700 text-gray-700 lght:text-gray-300">
                  <MdHelp className="text-xl" />
                  <span>Help & Support</span>
                </button>
                <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 lght:hover:bg-gray-700 text-gray-700 lght:text-gray-300">
                  <MdInfo className="text-xl" />
                  <span>About</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white lght:bg-gray-800 rounded-xl border overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <h1 className="text-2xl font-bold">Account Settings</h1>
                <p className="opacity-90">
                  Manage your preferences and security settings
                </p>
              </div>

              {/* Settings Sections */}
              <div className="p-6 space-y-8">
                {/* Notification Settings */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 lght:text-white">
                    <MdNotifications className="text-blue-500" />
                    <span>Notifications</span>
                  </h2>
                  <div className="space-y-4 pl-8">
                    <SettingToggle
                      icon={<MdNotifications className="text-green-500" />}
                      title="Notification Sound"
                      checked={settings.notification_sound}
                      onChange={() => handleToggle("notification_sound")}
                    />
                    <SettingToggle
                      icon={<MdEmail className="text-blue-500" />}
                      title="Email Updates"
                      checked={settings.get_email_updates}
                      onChange={() => handleToggle("get_email_updates")}
                    />
                  </div>
                </div>

                {/* Privacy & Security */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 lght:text-white">
                    <MdSecurity className="text-purple-500" />
                    <span>Privacy & Security</span>
                  </h2>
                  <div className="space-y-4 pl-8">
                    <SettingToggle
                      icon={<MdPerson className="text-purple-500" />}
                      title="Extra Privacy Mode"
                      checked={settings.make_me_extra_private}
                      onChange={() => handleToggle("make_me_extra_private")}
                    />
                    <SettingToggle
                      icon={<FiMoon className="text-indigo-500" />}
                      title="Light more (Coming soon)"
                      checked={settings.lght_mode}
                      onChange={() => handleToggle("lght_mode")}
                    />
                    <SettingToggle
                      icon={<MdSecurity className="text-red-500" />}
                      title="Two-Factor Authentication (Soon)"
                      checked={settings.two_factor_auth}
                      onChange={() => handleToggle("two_factor_auth")}
                    />
                    <SettingToggle
                      icon={<MdHistory className="text-orange-500" />}
                      title="Auto-lock After Inactivity (Soon)"
                      checked={settings.auto_lock}
                      onChange={() => handleToggle("auto_lock")}
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 lght:text-white">
                    <MdLanguage className="text-green-500" />
                    <span>Preferences</span>
                  </h2>
                  <div className="space-y-4 pl-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-700 lght:text-gray-300">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => handleSelectChange(e, "currency")}
                        className="p-2 border rounded-lg lght:bg-gray-700 lght:border-gray-600 lght:text-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="NGN">NGN (₦)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-700 lght:text-gray-300">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSelectChange(e, "language")}
                        className="p-2 border rounded-lg lght:bg-gray-700 lght:border-gray-600 lght:text-white"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 lght:text-white">
                    <MdAccountCircle className="text-blue-500" />
                    <span>Account</span>
                  </h2>
                  <div className="space-y-4 pl-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-700 lght:text-gray-300">
                        Username
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter username"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="p-2 border rounded-lg flex-1 lght:bg-gray-700 lght:border-gray-600 lght:text-white"
                          maxLength={15}
                        />
                        <button
                          onClick={handleUsernameUpdate}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PWA Install Button */}
                {isInstallable && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 lght:text-white">
                      <MdInstallMobile className="text-green-500" />
                      <span>Install App</span>
                    </h2>
                    <div className="pl-8">
                      <button
                        onClick={handleInstallClick}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                      >
                        <MdInstallMobile />
                        <span>Add to Home Screen</span>
                      </button>
                      <p className="text-sm text-gray-500 lght:text-gray-400 mt-2">
                        Install our app for faster access and offline
                        capabilities
                      </p>
                    </div>
                  </div>
                )}

                {/* Danger Zone */}
                <div className="space-y-4 border-t pt-6 border-red-100 lght:border-red-900/50">
                  <h2 className="text-xl font-semibold text-red-600 lght:text-red-400">
                    Danger Zone
                  </h2>
                  <div className="space-y-4 pl-8">
                    <button
                      onClick={() => setShowHistoryModal(true)}
                      className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                      <MdHistory />
                      <span>Clear All History</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      <MdDelete />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white lght:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 lght:text-white">
              Confirm Account Deletion
            </h3>
            <p className="mb-4 text-gray-600 lght:text-gray-300">
              This action cannot be undone. All your data will be permanently
              deleted.
            </p>
            <input
              type="email"
              placeholder="Your email"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              className="p-2 border rounded-lg w-full mb-3 lght:bg-gray-700 lght:border-gray-600 lght:text-white"
            />
            <input
              type="password"
              placeholder="Your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="p-2 border rounded-lg w-full mb-3 lght:bg-gray-700 lght:border-gray-600 lght:text-white"
            />
            {deleteError && <p className="text-red-500 mb-3">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 lght:text-gray-300 lght:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white lght:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 lght:text-white">
              Clear All History
            </h3>
            <p className="mb-6 text-gray-600 lght:text-gray-300">
              This will permanently delete all your activity history. This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 lght:text-gray-300 lght:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemoveHistory}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable toggle component
const SettingToggle = ({
  icon,
  title,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  checked: boolean;
  onChange: () => void;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-700 lght:text-gray-300">{title}</span>
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        className={`${
          checked ? "bg-blue-500" : "bg-gray-300 lght:bg-gray-600"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
      >
        <span
          className={`${
            checked ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>
    </div>
  );
};

export default SettingsComponent;
