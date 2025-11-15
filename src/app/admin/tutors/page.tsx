"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { Tutor, TutorStatus, Subject } from "@/lib/booking/types";

export default function TutorManagement() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TutorStatus | "all">("all");
  const [formData, setFormData] = useState<Partial<Tutor>>({
    name: "",
    email: "",
    subjects: [],
    hourlyRate: 30,
    status: "pending",
    commissionRate: 20,
    totalEarnings: 0,
  });

  const allSubjects: Subject[] = ["Math", "English", "Science", "History", "Geography", "Computer Science"];

  useEffect(() => {
    const allTutors = LocalDB.getAllTutors();
    setTutors(allTutors);
    setLoading(false);
  }, []);

  const handleAddTutor = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      subjects: [],
      hourlyRate: 30,
      status: "pending",
      commissionRate: 20,
      totalEarnings: 0,
    });
    setShowForm(true);
  };

  const handleEditTutor = (tutor: Tutor) => {
    setEditingId(tutor.id);
    setFormData(tutor);
    setShowForm(true);
  };

  const handleSaveTutor = () => {
    if (!formData.email || !formData.name) {
      alert("Please fill in required fields");
      return;
    }

    if (editingId) {
      const updated = LocalDB.updateTutor(editingId, formData);
      if (updated) {
        setTutors(tutors.map((t) => (t.id === editingId ? updated : t)));
      }
    } else {
      const created = LocalDB.createTutor(formData as Omit<Tutor, "id" | "createdAt" | "updatedAt">);
      setTutors([...tutors, created]);
    }
    setShowForm(false);
  };

  const handleDeleteTutor = (id: string) => {
    if (confirm("Are you sure you want to delete this tutor?")) {
      if (LocalDB.deleteTutor(id)) {
        setTutors(tutors.filter((t) => t.id !== id));
      }
    }
  };

  const handleApproveTutor = (id: string) => {
    const updated = LocalDB.updateTutor(id, { status: "approved", verifiedAt: new Date().toISOString() });
    if (updated) {
      setTutors(tutors.map((t) => (t.id === id ? updated : t)));
    }
  };

  const handleRejectTutor = (id: string) => {
    const updated = LocalDB.updateTutor(id, { status: "rejected" });
    if (updated) {
      setTutors(tutors.map((t) => (t.id === id ? updated : t)));
    }
  };

  const filteredTutors = filterStatus === "all" ? tutors : tutors.filter((t) => t.status === filterStatus);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tutor Management</h1>
          <p className="text-gray-600 mt-2">Manage tutors and approve applications</p>
        </div>
        <button
          onClick={handleAddTutor}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Tutor
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Tutors" value={tutors.length.toString()} color="blue" />
        <StatCard label="Approved" value={tutors.filter((t) => t.status === "approved").length.toString()} color="green" />
        <StatCard label="Pending" value={tutors.filter((t) => t.status === "pending").length.toString()} color="yellow" />
        <StatCard label="Rejected" value={tutors.filter((t) => t.status === "rejected").length.toString()} color="red" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TutorStatus | "all")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Tutors Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Subjects</th>
                <th className="text-left py-3 px-4 font-semibold">Hourly Rate</th>
                <th className="text-left py-3 px-4 font-semibold">Commission</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTutors.map((tutor) => (
                <tr key={tutor.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{tutor.name}</td>
                  <td className="py-3 px-4 text-gray-600">{tutor.email}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjects.slice(0, 2).map((subject) => (
                        <span key={subject} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          {subject}
                        </span>
                      ))}
                      {tutor.subjects.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                          +{tutor.subjects.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">£{tutor.hourlyRate}/hr</td>
                  <td className="py-3 px-4">{tutor.commissionRate}%</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={tutor.status} />
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleEditTutor(tutor)}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    {tutor.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApproveTutor(tutor.id)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTutor(tutor.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteTutor(tutor.id)}
                      className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTutors.length === 0 && (
          <div className="py-8 text-center text-gray-600">No tutors found</div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Tutor" : "Add New Tutor"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="About the tutor"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subjects *</label>
                <div className="space-y-2">
                  {allSubjects.map((subject) => (
                    <label key={subject} className="flex items-center gap-2">
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
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hourly Rate (£) *</label>
                <input
                  type="number"
                  value={formData.hourlyRate || 30}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  value={formData.commissionRate || 20}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status || "pending"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TutorStatus })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTutor}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color] || colorClasses.blue}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: TutorStatus }) {
  const styles: Record<TutorStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${styles[status]}`}>
      {status === "pending" ? "Pending Review" : status}
    </span>
  );
}
