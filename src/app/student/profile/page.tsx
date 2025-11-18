"use client";
import { useEffect, useState } from "react";
import { StudentDB, StudentProfile } from "@/lib/booking/student-storage";

export default function StudentProfileSettings() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [studentId] = useState("student_demo_001");
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "security">("profile");

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lessonReminders: true,
    announcementAlerts: true,
    homeworkReminders: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    allowParentAccess: true,
    allowTutorMessages: true,
  });

  useEffect(() => {
    let userProfile = StudentDB.getProfile(studentId);

    if (!userProfile) {
      userProfile = StudentDB.createProfile({
        studentId,
        name: "Alex Johnson",
        age: 14,
        schoolYear: "Year 9",
        subjects: ["Math", "English", "Science"],
        parentId: "parent_demo_001",
        parentEmail: "parent@example.com",
        bio: "I'm eager to learn and improve my grades!",
      });
    }

    setProfile(userProfile);
    setFormData(userProfile);
    setLoading(false);
  }, [studentId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "subjects") {
      const selectedSubjects = Array.from((e.target as HTMLSelectElement).selectedOptions, (option) => option.value);
      setFormData({ ...formData, subjects: selectedSubjects });
    } else if (name === "age") {
      setFormData({ ...formData, age: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updated = StudentDB.updateProfile(studentId, formData as Partial<StudentProfile>);
    if (updated) {
      setProfile(updated);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }

    setIsSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          👤 Profile & Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="border border-green-300 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <p className="text-green-900 font-medium">✅ {successMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          👤 Profile
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "settings"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "security"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          🔒 Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-700 mt-1">📚 {profile.schoolYear}</p>
                  <p className="text-gray-700 mt-1">🎓 Age {profile.age}</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-4">
              <h3 className="text-xl font-bold mb-4">Edit Profile Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ""}
                    onChange={handleInputChange}
                    min="5"
                    max="18"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                  <input
                    type="text"
                    name="schoolYear"
                    value={formData.schoolYear || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                  <select
                    name="subjects"
                    multiple
                    value={formData.subjects || []}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Math">Math</option>
                    <option value="English">English</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Age</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{profile.age} years old</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">School Year</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{profile.schoolYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Subjects</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.subjects?.map((subject) => (
                      <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Bio</p>
                  <p className="text-gray-700 mt-2">{profile.bio}</p>
                </div>
              )}

              {profile.parentId && (
                <div className="pt-4 border-t border-gray-200 p-4 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-700 mb-2">👨‍👩‍👧 Parent/Guardian</p>
                  <p className="text-gray-700">Parent ID: {profile.parentId}</p>
                  {profile.parentEmail && (
                    <p className="text-gray-700">Email: {profile.parentEmail}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-bold mb-4">🔔 Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        [key]: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {key === "emailNotifications" && "Email Notifications"}
                      {key === "lessonReminders" && "Lesson Reminders"}
                      {key === "announcementAlerts" && "Announcement Alerts"}
                      {key === "homeworkReminders" && "Homework Reminders"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {key === "emailNotifications" && "Receive updates via email"}
                      {key === "lessonReminders" && "Get reminded before lessons"}
                      {key === "announcementAlerts" && "Be notified of new announcements"}
                      {key === "homeworkReminders" && "Get reminded about pending homework"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-bold mb-4">🔐 Privacy Settings</h3>
            <div className="space-y-4">
              {Object.entries(privacySettings).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setPrivacySettings({
                        ...privacySettings,
                        [key]: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {key === "showOnlineStatus" && "Show Online Status"}
                      {key === "allowParentAccess" && "Allow Parent Access to Messages"}
                      {key === "allowTutorMessages" && "Allow Tutor Messages"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {key === "showOnlineStatus" && "Let tutors see when you're online"}
                      {key === "allowParentAccess" && "Your parent/guardian can view your messages"}
                      {key === "allowTutorMessages" && "Tutors can message you directly"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Save Settings
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-bold mb-4">🔐 Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter a new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Update Password
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-bold mb-4">ℹ️ Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Student ID</p>
                <p className="text-gray-900 font-mono mt-1">{profile.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Account Created</p>
                <p className="text-gray-900 mt-1">{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Last Updated</p>
                <p className="text-gray-900 mt-1">{new Date(profile.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-300 rounded-lg p-6 bg-gradient-to-br from-red-50 to-pink-50">
            <h3 className="text-xl font-bold text-red-900 mb-4">⚠️ Danger Zone</h3>
            <p className="text-red-800 mb-4">Careful! These actions cannot be undone.</p>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Safe Learning Tips */}
      <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h2 className="text-lg font-bold text-blue-900 mb-3">🛡️ Online Safety Tips</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Never share your password with anyone, not even tutors</li>
          <li>✓ Keep your account information private and secure</li>
          <li>✓ Be respectful and appropriate in all communications</li>
          <li>✓ Report any suspicious activity to your parent or tutor</li>
          <li>✓ If someone makes you uncomfortable, let a trusted adult know</li>
        </ul>
      </div>
    </div>
  );
}
