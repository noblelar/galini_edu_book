"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { Tutor, Subject } from "@/lib/booking/types";

export default function ProfilePage() {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutorId] = useState("tutor_demo_001");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Tutor>>({});

  const allSubjects: Subject[] = ["Math", "English", "Science", "History", "Geography", "Computer Science"];

  useEffect(() => {
    const allTutors = LocalDB.getAllTutors();
    let currentTutor = allTutors.find((t) => t.id === tutorId);

    if (!currentTutor) {
      currentTutor = LocalDB.createTutor({
        userId: tutorId,
        name: "John Smith",
        email: "john.smith@example.com",
        subjects: ["Math", "English"],
        hourlyRate: 30,
        status: "approved",
        commissionRate: 20,
        totalEarnings: 0,
      });
    }

    setTutor(currentTutor);
    setFormData(currentTutor);
    setLoading(false);
  }, [tutorId]);

  const handleSaveProfile = () => {
    if (!tutor) return;
    const updated = LocalDB.updateTutor(tutor.id, formData);
    if (updated) {
      setTutor(updated);
      setEditMode(false);
    }
  };

  if (loading || !tutor) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your tutor profile and credentials</p>
        </div>
        <button
          onClick={() => {
            if (editMode) {
              handleSaveProfile();
            } else {
              setFormData(tutor);
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
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold">
            {tutor.name.charAt(0)}
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
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio || ""}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Write something about yourself..."
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold">{tutor.name}</h2>
                <p className="text-gray-600">{tutor.email}</p>
                {tutor.bio && <p className="text-gray-700 mt-3">{tutor.bio}</p>}
              </div>
            )}
          </div>
        </div>

        {tutor.status === "approved" && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-lg">✅</span>
            <div>
              <p className="font-medium text-green-900">Verified Tutor</p>
              <p className="text-sm text-green-800">Your profile has been verified and approved</p>
            </div>
          </div>
        )}
      </div>

      {/* Subjects & Expertise */}
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Subjects & Expertise</h3>
          {editMode && (
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Edit Subjects
            </button>
          )}
        </div>

        {editMode ? (
          <div className="space-y-2">
            {allSubjects.map((subject) => (
              <label key={subject} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-blue-50">
                <input
                  type="checkbox"
                  checked={(formData.subjects || []).includes(subject)}
                  onChange={(e) => {
                    const subjects = formData.subjects || [];
                    if (e.target.checked) {
                      setFormData({ ...formData, subjects: [...subjects, subject] });
                    } else {
                      setFormData({ ...formData, subjects: subjects.filter((s) => s !== subject) });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="font-medium">{subject}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tutor.subjects.map((subject) => (
              <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
                {subject}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Qualifications & Experience */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">Qualifications & Experience</h3>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Qualifications</label>
              <textarea
                value={formData.qualifications || ""}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="e.g., Bachelor's in Mathematics, PGCE, 5 years teaching experience"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tutor.qualifications ? (
              <p className="text-gray-700">{tutor.qualifications}</p>
            ) : (
              <p className="text-gray-500">No qualifications added yet</p>
            )}
          </div>
        )}
      </div>

      {/* Hourly Rate */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">Hourly Rate</h3>

        {editMode ? (
          <div>
            <label className="block text-sm font-medium mb-2">Rate (£/hour)</label>
            <input
              type="number"
              value={formData.hourlyRate || 0}
              onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              min="0"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-blue-600">£{tutor.hourlyRate}</span>
            <span className="text-gray-600">/hour</span>
          </div>
        )}
      </div>

      {/* Identity Verification */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">Identity Verification</h3>

        {tutor.verifiedAt ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-lg">✅</span>
            <div>
              <p className="font-medium text-green-900">Verified</p>
              <p className="text-sm text-green-800">
                Verified on {new Date(tutor.verifiedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <span className="text-lg">⏳</span>
            <div>
              <p className="font-medium text-yellow-900">Pending Verification</p>
              <p className="text-sm text-yellow-800">Upload your ID documents to get verified</p>
            </div>
          </div>
        )}

        <button className="mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
          📄 Upload ID Document
        </button>
      </div>

      {/* Contact Information */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold mb-4">Contact Information</h3>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+44 123 4567890"
              />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700">{tutor.phone || "Not provided"}</p>
          </div>
        )}
      </div>

      {editMode && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditMode(false);
              setFormData(tutor);
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
