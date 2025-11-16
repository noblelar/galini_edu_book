"use client";
import { useEffect, useState } from "react";
import { ParentDB, ParentAnnouncement } from "@/lib/booking/parent-storage";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<ParentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId] = useState("parent_demo_001");
  const [filterSource, setFilterSource] = useState<"all" | "tutor" | "admin" | "system">("all");

  useEffect(() => {
    const anns = ParentDB.getAnnouncementsByParent(parentId);
    setAnnouncements(anns);
    setLoading(false);
  }, [parentId]);

  const handleMarkAsRead = (id: string) => {
    const updated = ParentDB.markAnnouncementAsRead(id);
    if (updated) {
      setAnnouncements(announcements.map((a) => (a.id === id ? updated : a)));
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm("Delete this announcement?")) {
      if (ParentDB.deleteAnnouncement(id)) {
        setAnnouncements(announcements.filter((a) => a.id !== id));
      }
    }
  };

  const filteredAnnouncements = filterSource === "all" ? announcements : announcements.filter((a) => a.source === filterSource);
  const unreadCount = announcements.filter((a) => !a.readAt).length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Announcements</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `${unreadCount} unread announcement${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "tutor", "admin", "system"] as const).map((source) => (
          <button
            key={source}
            onClick={() => setFilterSource(source)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterSource === source ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {source === "all" ? "All" : source === "tutor" ? "👨‍🏫 Tutors" : source === "admin" ? "👤 Admin" : "📢 System"}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`border rounded-lg p-5 transition-all ${
                ann.readAt ? "bg-white border-gray-200" : "bg-blue-50 border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{ann.title}</h3>
                    {!ann.readAt && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                  </div>
                  <p className="text-gray-700 mb-3">{ann.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                      {ann.source === "tutor" ? "👨‍🏫" : ann.source === "admin" ? "👤" : "📢"} {ann.sourceName}
                    </span>
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {!ann.readAt && (
                    <button
                      onClick={() => handleMarkAsRead(ann.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-medium"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">No announcements</p>
          </div>
        )}
      </div>
    </div>
  );
}
