"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { SubjectConfig } from "@/lib/booking/types";

export default function SubjectsManagement() {
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SubjectConfig>>({
    name: undefined,
    description: "",
    recommendedRate: 30,
    recommendedDuration: 2,
  });

  useEffect(() => {
    LocalDB.initializeSubjects();
    const allSubjects = LocalDB.getAllSubjects();
    setSubjects(allSubjects);
    setLoading(false);
  }, []);

  const handleAddSubject = () => {
    setEditingName(null);
    setFormData({
      name: undefined,
      description: "",
      recommendedRate: 30,
      recommendedDuration: 2,
    });
    setShowForm(true);
  };

  const handleEditSubject = (subject: SubjectConfig) => {
    setEditingName(subject.name);
    setFormData(subject);
    setShowForm(true);
  };

  const handleSaveSubject = () => {
    if (!formData.name) {
      alert("Please fill in required fields");
      return;
    }

    if (editingName && editingName !== formData.name) {
      // Renaming not supported in current logic, just update
      const updated = LocalDB.updateSubject(editingName, formData);
      if (updated) {
        setSubjects(subjects.map((s) => (s.name === editingName ? updated : s)));
      }
    } else if (editingName) {
      const updated = LocalDB.updateSubject(editingName, formData);
      if (updated) {
        setSubjects(subjects.map((s) => (s.name === editingName ? updated : s)));
      }
    } else {
      const created = LocalDB.createSubject(formData as Omit<SubjectConfig, "id" | "createdAt">);
      setSubjects([...subjects, created]);
    }
    setShowForm(false);
  };

  const handleDeleteSubject = (name: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      if (LocalDB.deleteSubject(name)) {
        setSubjects(subjects.filter((s) => s.name !== name));
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects Management</h1>
          <p className="text-gray-600 mt-2">Manage tutoring subjects and rates</p>
        </div>
        <button
          onClick={handleAddSubject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Subject
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Subjects" value={subjects.length.toString()} />
        <StatCard label="Avg Hourly Rate" value={`£${(subjects.reduce((sum, s) => sum + s.recommendedRate, 0) / Math.max(subjects.length, 1)).toFixed(2)}`} />
        <StatCard label="Avg Duration" value={`${(subjects.reduce((sum, s) => sum + s.recommendedDuration, 0) / Math.max(subjects.length, 1)).toFixed(1)} hrs`} />
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="border rounded-lg p-5 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold">{subject.name}</h3>
                {subject.description && (
                  <p className="text-sm text-gray-600 mt-1">{subject.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recommended Rate</span>
                <span className="font-semibold">£{subject.recommendedRate}/hr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recommended Duration</span>
                <span className="font-semibold">{subject.recommendedDuration} hours</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditSubject(subject)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteSubject(subject.name)}
                className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-8 text-gray-600">No subjects found</div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{editingName ? "Edit Subject" : "Add New Subject"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value as any })}
                  disabled={!!editingName}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subject description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recommended Hourly Rate (£) *</label>
                <input
                  type="number"
                  value={formData.recommendedRate || 30}
                  onChange={(e) => setFormData({ ...formData, recommendedRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recommended Duration (hours) *</label>
                <input
                  type="number"
                  value={formData.recommendedDuration || 2}
                  onChange={(e) => setFormData({ ...formData, recommendedDuration: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.5"
                  step="0.5"
                />
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
                onClick={handleSaveSubject}
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
      <p className="text-sm font-medium text-purple-900">{label}</p>
      <p className="text-2xl font-bold text-purple-900 mt-2">{value}</p>
    </div>
  );
}
