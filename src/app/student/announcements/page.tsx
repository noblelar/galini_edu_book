"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentDB, StudentAnnouncement } from "@/lib/booking/student-storage";

type FilterType = "all" | "unread" | "read";

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId] = useState("student_demo_001");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const allAnnouncements = StudentDB.getAnnouncementsByStudent(studentId);

    // Add demo announcements if none exist
    if (allAnnouncements.length === 0) {
      const demoAnnouncements = [
        {
          title: "Important: Exam Preparation Resources",
          content: "Dear students, I've uploaded new exam preparation materials to the platform. Please review them thoroughly and let me know if you have any questions. The exam will cover chapters 1-5.",
          tutorId: "tutor_001",
          tutorName: "John Smith",
          relatedSubject: "Math",
          createdAt: new Date().toISOString(),
        },
        {
          title: "Class Schedule Changes Next Week",
          content: "Please note that our lesson next Tuesday has been moved to Wednesday at 4:00 PM due to unforeseen circumstances. Apologies for the inconvenience.",
          tutorId: "tutor_002",
          tutorName: "Jane Doe",
          relatedSubject: "English",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          readAt: new Date().toISOString(),
        },
        {
          title: "Excellent Progress This Month!",
          content: "I'm impressed with the improvement in your essays. Your latest piece showed much better structure and argumentation. Keep up the great work!",
          tutorId: "tutor_002",
          tutorName: "Jane Doe",
          relatedSubject: "English",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          readAt: new Date().toISOString(),
        },
        {
          title: "New Science Lab Activity",
          content: "Next lesson we'll be doing an interactive lab on chemical reactions. Please bring a notebook and pen. Safety goggles will be provided.",
          tutorId: "tutor_003",
          tutorName: "Dr. Green",
          relatedSubject: "Science",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          readAt: new Date().toISOString(),
        },
        {
          title: "Holiday Break Notice",
          content: "Please note that there will be no lessons from December 20-27 due to the holiday break. Lessons will resume on December 28.",
          tutorId: "tutor_004",
          tutorName: "Mr. Brown",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          readAt: new Date().toISOString(),
        },
      ];

      demoAnnouncements.forEach((ann) => {
        StudentDB.addAnnouncement({
          ...ann,
          studentId,
        });
      });

      setAnnouncements(demoAnnouncements.map((a) => ({ ...a, studentId, id: "", createdAt: a.createdAt })));
    } else {
      setAnnouncements(allAnnouncements);
    }

    const uniqueSubjects = Array.from(new Set(allAnnouncements.map((a) => a.relatedSubject).filter(Boolean)));
    setSubjects(uniqueSubjects);

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    let filtered = announcements;

    if (filterType === "unread") {
      filtered = filtered.filter((a) => !a.readAt);
    } else if (filterType === "read") {
      filtered = filtered.filter((a) => a.readAt);
    }

    if (filterSubject) {
      filtered = filtered.filter((a) => a.relatedSubject === filterSubject);
    }

    setFilteredAnnouncements(filtered);
  }, [announcements, filterType, filterSubject]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const unreadCount = announcements.filter((a) => !a.readAt).length;
  const readCount = announcements.filter((a) => a.readAt).length;

  const handleMarkAsRead = (announcementId: string) => {
    const updated = StudentDB.markAnnouncementAsRead(announcementId);
    if (updated) {
      setAnnouncements(
        announcements.map((a) => (a.id === announcementId ? updated : a))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📢 Announcements
        </h1>
        <p className="text-gray-600 mt-2">Stay updated with important information from your tutors</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
          <p className="text-sm font-medium text-blue-900 uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{announcements.length}</p>
          <p className="text-xs text-blue-800 mt-1">announcements</p>
        </div>
        <div className="border border-amber-300 rounded-lg p-6 bg-gradient-to-br from-amber-50 to-yellow-50">
          <p className="text-sm font-medium text-amber-900 uppercase tracking-wide">Unread</p>
          <p className="text-3xl font-bold text-amber-900 mt-2">{unreadCount}</p>
          <p className="text-xs text-amber-800 mt-1">new messages</p>
        </div>
        <div className="border border-green-300 rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50">
          <p className="text-sm font-medium text-green-900 uppercase tracking-wide">Read</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{readCount}</p>
          <p className="text-xs text-green-800 mt-1">viewed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <div className="flex gap-2 flex-wrap">
              {(["all", "unread", "read"] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`border rounded-lg p-6 shadow-sm transition-all hover:shadow-lg ${
                announcement.readAt
                  ? "border-gray-200 bg-white"
                  : "border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{announcement.title}</h3>
                    {!announcement.readAt && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{announcement.content}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold text-gray-900">👨‍🏫</span> From {announcement.tutorName}
                    </div>
                    {announcement.relatedSubject && (
                      <div>
                        <span className="font-semibold text-gray-900">📚</span> {announcement.relatedSubject}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-gray-900">📅</span> {formatDate(announcement.createdAt)}
                    </div>
                  </div>

                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">📎 Attachments:</p>
                      <div className="space-y-1">
                        {announcement.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment}
                            className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Download: {attachment}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!announcement.readAt && (
                  <button
                    onClick={() => handleMarkAsRead(announcement.id)}
                    className="ml-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 text-lg mb-2">No announcements found</p>
            <p className="text-gray-500 text-sm">Check back later for updates from your tutors</p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h2 className="text-lg font-bold text-blue-900 mb-3">💡 Tips</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Check announcements regularly for important updates</li>
          <li>✓ Mark announcements as read to keep track of what you've seen</li>
          <li>✓ Download important materials immediately</li>
          <li>✓ Reply to announcements through messages if you have questions</li>
        </ul>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
