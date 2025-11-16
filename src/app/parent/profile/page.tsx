"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { ParentDB, ParentChild } from "@/lib/booking/parent-storage";
import { ParentProfile } from "@/lib/booking/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId] = useState("parent_demo_001");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<ParentProfile>>({});

  useEffect(() => {
    let parentProfile = LocalDB.getParentByEmail("parent@example.com");
    if (!parentProfile) {
      parentProfile = LocalDB.upsertParent({
        name: "Sarah Johnson",
        email: "parent@example.com",
        childName: "",
        schoolYear: "",
        verified: true,
      });
    }

    const childrenList = ParentDB.getChildrenByParent(parentId);
    setProfile(parentProfile);
    setChildren(childrenList);
    setFormData(parentProfile);
    setLoading(false);
  }, [parentId]);

  const handleSaveProfile = () => {
    if (!profile || !formData.name || !formData.email) {
      alert("Please fill in required fields");
      return;
    }

    const updated = LocalDB.upsertParent({
      id: profile.id,
      name: formData.name,
      email: formData.email,
      childName: formData.childName || "",
      schoolYear: formData.schoolYear || "",
      verified: profile.verified,
    });

    setProfile(updated);
    setEditMode(false);
  };

  if (loading || !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>
        <button
          onClick={() => {
            if (editMode) {
              handleSaveProfile();
            } else {
              setFormData(profile);
              setEditMode(true);
            }
          }}
          className={`px-4 py-2 rounded-lg font-medium ${
            editMode
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {editMode ? "✓ Save Changes" : "✏️ Edit Profile"}
        </button>
      </div>

      {/* Profile Card */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold">
            {profile.name.charAt(0)}
          </div>

          <div className="flex-1">
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-gray-600 mt-1">{profile.email}</p>
                {profile.verified && (
                  <p className="text-sm text-green-600 font-medium mt-2">✓ Email Verified</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children Summary */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-bold mb-4">Connected Children ({children.length})</h3>
        {children.length > 0 ? (
          <div className="space-y-3">
            {children.map((child) => (
              <div key={child.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div>
                  <p className="font-medium">{child.name}</p>
                  <p className="text-sm text-gray-600">{child.schoolYear} • {child.age} years old</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {child.subjects.length} subject{child.subjects.length !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No children added yet</p>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-bold mb-4">📬 Notifications</h3>
        <div className="space-y-4">
          <Toggle label="Email Notifications" description="Receive emails about bookings and messages" defaultChecked={true} />
          <Toggle label="SMS Reminders" description="Get SMS reminders for upcoming lessons" defaultChecked={false} />
          <Toggle label="Lesson Reminders" description="Reminders 24 hours before lessons" defaultChecked={true} />
          <Toggle label="Marketing Emails" description="Updates and promotional content" defaultChecked={false} />
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-bold mb-4">💳 Payment Methods</h3>
        <div className="space-y-3">
          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-sm text-gray-600">Expires 12/25</p>
            </div>
            <button className="text-red-600 hover:text-red-700 font-medium text-sm">Remove</button>
          </div>
          <button className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium mt-4">
            + Add Payment Method
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-bold mb-4">🔐 Security</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-between">
            <span>🔑 Change Password</span>
            <span>→</span>
          </button>
          <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-between">
            <span>🔒 Two-Factor Authentication</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50 shadow-sm">
        <h3 className="text-xl font-bold text-red-900 mb-4">⚠️ Danger Zone</h3>
        <button className="w-full px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-100 font-medium">
          🗑️ Delete Account
        </button>
      </div>

      {editMode && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditMode(false);
              setFormData(profile);
            }}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

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
          onChange={(e) => setChecked(e.target.checked)}
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
