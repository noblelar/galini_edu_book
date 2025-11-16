"use client";
import { useEffect, useState } from "react";
import { TutorDB } from "@/lib/booking/tutor-storage";
import { TutorAvailability } from "@/lib/booking/types";

export default function AvailabilityManagement() {
  const [availability, setAvailability] = useState<TutorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorId] = useState("tutor_demo_001");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "11:00",
    recurring: true,
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const avail = TutorDB.getAvailabilityByTutor(tutorId);
    setAvailability(avail);
    setLoading(false);
  }, [tutorId]);

  const handleAddAvailability = () => {
    if (editingId) {
      const updated = TutorDB.updateAvailability(editingId, formData);
      if (updated) {
        setAvailability(availability.map((a) => (a.id === editingId ? updated : a)));
      }
    } else {
      const created = TutorDB.createAvailability({
        tutorId,
        ...formData,
        blockedDates: [],
      });
      setAvailability([...availability, created]);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "11:00",
      recurring: true,
    });
  };

  const handleEditSlot = (slot: TutorAvailability) => {
    setEditingId(slot.id);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      recurring: slot.recurring,
    });
    setShowForm(true);
  };

  const handleDeleteSlot = (id: string) => {
    if (confirm("Delete this availability slot?")) {
      if (TutorDB.deleteAvailability(id)) {
        setAvailability(availability.filter((a) => a.id !== id));
      }
    }
  };

  const groupedByDay = days.reduce(
    (acc, day) => {
      acc[day] = availability.filter((a) => a.dayOfWeek === day);
      return acc;
    },
    {} as Record<string, TutorAvailability[]>
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Your Availability</h1>
          <p className="text-gray-600 mt-2">Set your teaching hours and time slots</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              dayOfWeek: "Monday",
              startTime: "09:00",
              endTime: "11:00",
              recurring: true,
            });
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Time Slot
        </button>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-3">
        {days.map((day) => (
          <div key={day} className="border rounded-lg p-4 bg-white">
            <h3 className="font-bold text-lg mb-3">{day}</h3>
            {groupedByDay[day].length > 0 ? (
              <div className="space-y-2">
                {groupedByDay[day].map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                    <div>
                      <p className="font-semibold">
                        {slot.startTime} – {slot.endTime}
                      </p>
                      <p className="text-sm text-gray-600">
                        {slot.recurring ? "Every week" : "One-time"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSlot(slot)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No availability set for {day}</p>
            )}
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Time Slot" : "Add Time Slot"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Day of Week *</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Recurring every week</span>
              </label>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAvailability}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="border-t pt-6">
        <h2 className="font-bold text-lg mb-4">📌 Tips</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Set your availability in 2-hour blocks</li>
          <li>• Enable "Recurring" for slots that repeat every week</li>
          <li>• Students will see your available time slots when booking</li>
          <li>• You can add or remove slots anytime</li>
          <li>• Block out dates when you're unavailable by editing an existing slot</li>
        </ul>
      </div>
    </div>
  );
}
