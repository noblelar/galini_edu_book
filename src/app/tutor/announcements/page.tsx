"use client";
import { useEffect, useState } from "react";
import { TutorDB } from "@/lib/booking/tutor-storage";
import { LocalDB } from "@/lib/booking/storage";
import { Announcement, Booking } from "@/lib/booking/types";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorId] = useState("tutor_demo_001");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    audience: "all",
    targetStudentId: "",
    targetGroupId: "",
    publishDate: "",
  });

  useEffect(() => {
    const anns = TutorDB.getAnnouncementsByTutor(tutorId);
    const books = LocalDB.listBookings().filter((b) => b.tutorId === tutorId || !b.tutorId);
    setAnnouncements(anns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setBookings(books);
    setLoading(false);
  }, [tutorId]);

  const handleCreateAnnouncement = () => {
    if (!formData.title || !formData.content) {
      alert("Please fill in title and content");
      return;
    }

    const created = TutorDB.createAnnouncement({
      tutorId,
      title: formData.title,
      content: formData.content,
      audience: formData.audience as any,
      targetStudentId: formData.audience === "student" ? formData.targetStudentId : undefined,
      targetGroupId: formData.audience === "group" ? formData.targetGroupId : undefined,
      publishDate: formData.publishDate || new Date().toISOString(),
    });

    setAnnouncements([created, ...announcements]);
    setShowForm(false);
    setFormData({
      title: "",
      content: "",
      audience: "all",
      targetStudentId: "",
      targetGroupId: "",
      publishDate: "",
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm("Delete this announcement?")) {
      if (TutorDB.deleteAnnouncement(id)) {
        setAnnouncements(announcements.filter((a) => a.id !== id));
      }
    }
  };

  const students = Array.from(new Set(bookings.map((b) => b.studentName)));

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-gray-600 mt-2">Create and manage announcements for your students</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Create Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div key={ann.id} className="border rounded-lg p-5 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{ann.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-600">
                      Posted {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ann.audience === "all" ? "bg-blue-100 text-blue-800" :
                      ann.audience === "group" ? "bg-purple-100 text-purple-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {ann.audience === "all" ? "All Students" : ann.audience === "group" ? "Group" : "Individual"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
                >
                  Delete
                </button>
              </div>

              <p className="text-gray-700 mt-4">{ann.content}</p>

              {ann.publishDate && new Date(ann.publishDate) > new Date() && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  📅 Scheduled for {new Date(ann.publishDate).toLocaleString()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">No announcements yet</p>
            <p className="text-sm mt-2">Create your first announcement to get started</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Announcement</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Write your announcement..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Send To *</label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Students</option>
                  <option value="group">Group Lesson Students</option>
                  <option value="student">Individual Student</option>
                </select>
              </div>

              {formData.audience === "student" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Student</label>
                  <select
                    value={formData.targetStudentId}
                    onChange={(e) => setFormData({ ...formData, targetStudentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student} value={student}>
                        {student}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Publish Date (optional)</label>
                <input
                  type="datetime-local"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
