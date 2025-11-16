"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsReminders: false,
    lessonReminders: true,
    marketingEmails: false,
    autoConfirmBookings: false,
    showPhoneNumber: false,
    darkMode: false,
    language: "en",
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and notifications</p>
      </div>

      {/* Notification Settings */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">📬 Notification Settings</h3>

        <div className="space-y-4">
          <SettingToggle
            label="Email Notifications"
            description="Receive email updates about bookings and messages"
            checked={settings.emailNotifications}
            onChange={() => handleToggle("emailNotifications")}
          />

          <SettingToggle
            label="SMS Reminders"
            description="Get SMS reminders for upcoming lessons"
            checked={settings.smsReminders}
            onChange={() => handleToggle("smsReminders")}
          />

          <SettingToggle
            label="Lesson Reminders"
            description="Receive reminders 24 hours before lessons"
            checked={settings.lessonReminders}
            onChange={() => handleToggle("lessonReminders")}
          />

          <SettingToggle
            label="Marketing Emails"
            description="Receive tips, updates, and promotional content"
            checked={settings.marketingEmails}
            onChange={() => handleToggle("marketingEmails")}
          />
        </div>
      </div>

      {/* Booking Settings */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">📅 Booking Settings</h3>

        <div className="space-y-4">
          <SettingToggle
            label="Auto-Confirm Bookings"
            description="Automatically confirm bookings that match your availability"
            checked={settings.autoConfirmBookings}
            onChange={() => handleToggle("autoConfirmBookings")}
          />

          <SettingToggle
            label="Show Phone Number"
            description="Display your phone number on your tutor profile"
            checked={settings.showPhoneNumber}
            onChange={() => handleToggle("showPhoneNumber")}
          />
        </div>
      </div>

      {/* Account Settings */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">⚙️ Account Settings</h3>

        <div className="space-y-4">
          <SettingToggle
            label="Dark Mode"
            description="Use dark theme for the tutor dashboard"
            checked={settings.darkMode}
            onChange={() => handleToggle("darkMode")}
          />

          <div className="py-4 border-t">
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account & Security */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">🔐 Account & Security</h3>

        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded border border-gray-200 font-medium flex items-center justify-between">
            <span>🔑 Change Password</span>
            <span>→</span>
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded border border-gray-200 font-medium flex items-center justify-between">
            <span>🔒 Two-Factor Authentication</span>
            <span>→</span>
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded border border-gray-200 font-medium flex items-center justify-between">
            <span>📋 Active Sessions</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <h3 className="text-xl font-bold mb-4 text-red-900">⚠️ Danger Zone</h3>

        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-white hover:bg-red-100 rounded border border-red-200 font-medium flex items-center justify-between text-red-700">
            <span>🗑️ Deactivate Account</span>
            <span>→</span>
          </button>
          <button className="w-full text-left px-4 py-3 bg-white hover:bg-red-100 rounded border border-red-200 font-medium flex items-center justify-between text-red-700">
            <span>🗑️ Delete Account</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Help & Support */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">💬 Help & Support</h3>

        <div className="space-y-3">
          <a
            href="/help"
            className="block px-4 py-3 hover:bg-gray-50 rounded border border-gray-200 font-medium flex items-center justify-between"
          >
            <span>📖 View Documentation</span>
            <span>→</span>
          </a>
          <a
            href="/contact"
            className="block px-4 py-3 hover:bg-gray-50 rounded border border-gray-200 font-medium flex items-center justify-between"
          >
            <span>📧 Contact Support</span>
            <span>→</span>
          </a>
          <a
            href="/feedback"
            className="block px-4 py-3 hover:bg-gray-50 rounded border border-gray-200 font-medium flex items-center justify-between"
          >
            <span>💡 Send Feedback</span>
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 font-medium">
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-block w-10 h-6">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`w-10 h-6 rounded-full transition-colors ${
            checked ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              checked ? "transform translate-x-4" : ""
            }`}
          />
        </div>
      </label>
    </div>
  );
}
