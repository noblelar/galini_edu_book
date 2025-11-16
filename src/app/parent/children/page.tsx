"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { ParentDB, ParentChild } from "@/lib/booking/parent-storage";
import { Booking } from "@/lib/booking/types";

export default function ChildrenPage() {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId] = useState("parent_demo_001");
  const [showForm, setShowForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    schoolYear: "",
    subjects: [] as string[],
  });

  const allSubjects = ["Math", "English", "Science", "History", "Geography", "Computer Science"];

  useEffect(() => {
    const childrenList = ParentDB.getChildrenByParent(parentId);
    const allBookings = LocalDB.listBookings().filter((b) => b.parentId === parentId);
    setChildren(childrenList);
    setBookings(allBookings);
    setLoading(false);
  }, [parentId]);

  const handleAddChild = () => {
    if (!formData.name || !formData.age || !formData.schoolYear) {
      alert("Please fill in all fields");
      return;
    }

    const created = ParentDB.addChild(parentId, {
      name: formData.name,
      age: parseInt(formData.age),
      schoolYear: formData.schoolYear,
      subjects: formData.subjects,
    });

    setChildren([...children, created]);
    setShowForm(false);
    setFormData({ name: "", age: "", schoolYear: "", subjects: [] });
  };

  const handleDeleteChild = (id: string) => {
    if (confirm("Delete this child?")) {
      if (ParentDB.deleteChild(id)) {
        setChildren(children.filter((c) => c.id !== id));
        setSelectedChild(null);
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
          <h1 className="text-4xl font-bold">My Children</h1>
          <p className="text-gray-600 mt-2">Manage your children's learning profiles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Child
        </button>
      </div>

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.length > 0 ? (
          children.map((child) => {
            const childBookings = bookings.filter((b) => b.studentName === child.name);
            const completed = childBookings.filter((b) => b.status === "completed").length;
            const progress = Math.round((completed / Math.max(childBookings.length, 1)) * 100);

            return (
              <div
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{child.name}</h3>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {child.name.charAt(0)}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <strong>Age:</strong> {child.age} years
                  </p>
                  <p className="text-gray-600">
                    <strong>Year:</strong> {child.schoolYear}
                  </p>
                  <div>
                    <p className="text-gray-600 mb-1"><strong>Subjects:</strong></p>
                    <div className="flex flex-wrap gap-1">
                      {child.subjects.map((subject) => (
                        <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-gray-600 mb-1"><strong>Progress</strong></p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{completed} of {childBookings.length} lessons completed</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-600">
            <p className="text-lg">No children added yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Add Your First Child
            </button>
          </div>
        )}
      </div>

      {/* Add Child Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Child</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Child's name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age *</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="3"
                    max="18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">School Year *</label>
                  <input
                    type="text"
                    value={formData.schoolYear}
                    onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Year 5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subjects</label>
                <div className="space-y-2">
                  {allSubjects.map((subject) => (
                    <label key={subject} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, subjects: [...formData.subjects, subject] });
                          } else {
                            setFormData({
                              ...formData,
                              subjects: formData.subjects.filter((s) => s !== subject),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
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
                onClick={handleAddChild}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add Child
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Child Details Modal */}
      {selectedChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedChild.name}</h2>
              <button onClick={() => setSelectedChild(null)} className="text-2xl text-gray-500">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-semibold">{selectedChild.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">School Year</p>
                <p className="font-semibold">{selectedChild.schoolYear}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {selectedChild.subjects.map((subject) => (
                    <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {selectedChild.progressNotes && (
              <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Progress Notes</p>
                <p className="text-gray-800">{selectedChild.progressNotes}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteChild(selectedChild.id)}
                className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium"
              >
                Delete Child
              </button>
              <button
                onClick={() => setSelectedChild(null)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
