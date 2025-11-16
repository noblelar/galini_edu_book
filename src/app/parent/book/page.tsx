"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { ParentDB } from "@/lib/booking/parent-storage";
import { Tutor, Subject, ParentChild } from "@/lib/booking/types";
import { formatCurrency } from "@/lib/booking/admin";

export default function BookingPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId] = useState("parent_demo_001");

  // Booking state
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | "">("");
  const [selectedLessonType, setSelectedLessonType] = useState<"one_to_one" | "group">("one_to_one");
  const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const allSubjects: Subject[] = ["Math", "English", "Science", "History", "Geography", "Computer Science"];
  const timeSlots = [
    "09:00–11:00",
    "11:00–13:00",
    "13:00–15:00",
    "15:00–17:00",
    "17:00–19:00",
    "19:00–21:00",
  ];

  useEffect(() => {
    const allTutors = LocalDB.getAllTutors().filter((t) => t.status === "approved");
    const childrenList = ParentDB.getChildrenByParent(parentId);

    setTutors(allTutors);
    setChildren(childrenList);

    if (allTutors.length > 0) {
      setSelectedTutor(allTutors[0]);
    }
    if (childrenList.length > 0) {
      setSelectedChild(childrenList[0]);
    }

    setLoading(false);
  }, [parentId]);

  const handleConfirmBooking = () => {
    if (!selectedTutor || !selectedSubject || !selectedDate || !selectedSlot || !selectedChild) {
      alert("Please fill in all fields");
      return;
    }

    const rate = selectedLessonType === "one_to_one" ? 30 : 20;
    const total = rate * 2; // 2-hour session

    const booking = LocalDB.addBooking(parentId, {
      studentName: selectedChild.name,
      tutorId: selectedTutor.id,
      subject: selectedSubject,
      lessonType: selectedLessonType,
      date: selectedDate,
      slot: selectedSlot,
      hours: 2,
      ratePerHour: rate,
      total,
      currency: "GBP",
      status: "pending",
    });

    // Redirect to checkout
    window.location.href = `/parent/checkout?bookingId=${booking.id}`;
  };

  const filteredTutors = selectedSubject
    ? tutors.filter((t) => t.subjects.includes(selectedSubject))
    : tutors;

  const getCalendarDays = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const prevLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    const nextDays = 7 - lastDay.getDay();

    const daysArray = [];
    for (let i = firstDay.getDay(); i > 0; i--) {
      daysArray.push({ date: prevLastDay - i + 1, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push({ date: i, isCurrentMonth: true });
    }
    for (let i = 1; i <= nextDays; i++) {
      daysArray.push({ date: i, isCurrentMonth: false });
    }

    return daysArray;
  };

  const getDateString = (dayNum: number) => {
    return `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
  };

  const price = selectedLessonType === "one_to_one" ? 30 : 20;
  const totalPrice = price * 2;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Book a Lesson</h1>
        <p className="text-gray-600 mt-2">Choose your tutor, subject, and preferred time</p>
      </div>

      {/* Lesson Type & Subject Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h3 className="font-bold text-lg mb-4">Lesson Type</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50 cursor-pointer">
              <input
                type="radio"
                checked={selectedLessonType === "one_to_one"}
                onChange={() => setSelectedLessonType("one_to_one")}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-semibold">One-on-One</p>
                <p className="text-sm text-gray-600">£30/hour (£60 for 2 hours)</p>
              </div>
            </label>

            <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-300">
              <input
                type="radio"
                checked={selectedLessonType === "group"}
                onChange={() => setSelectedLessonType("group")}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-semibold">Group (Max 5 pupils)</p>
                <p className="text-sm text-gray-600">£20/hour per pupil (£40 for 2 hours)</p>
              </div>
            </label>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h3 className="font-bold text-lg mb-4">Subject</h3>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value as Subject);
              setSelectedTutor(null);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="">Select a subject</option>
            {allSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tutor Selection */}
      {selectedSubject && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h3 className="font-bold text-lg mb-4">Select Your Tutor</h3>
          {filteredTutors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  onClick={() => setSelectedTutor(tutor)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTutor?.id === tutor.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {tutor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{tutor.name}</p>
                      <p className="text-xs text-gray-600">⭐ Verified</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Rate:</strong> £{tutor.hourlyRate}/hr
                    </p>
                    <div>
                      <strong className="text-gray-700">Subjects:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tutor.subjects.map((subject) => (
                          <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>No tutors available for this subject</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Layout: Calendar + Time Slots */}
      {selectedSubject && selectedTutor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Booking Summary */}
          <div className="lg:col-span-1 border border-gray-200 rounded-lg p-6 bg-white shadow-sm h-fit sticky top-6">
            <h3 className="font-bold text-lg mb-4">Booking Summary</h3>

            <div className="space-y-4 text-sm">
              <div className="pb-3 border-b">
                <p className="text-gray-600 text-xs">Tutor</p>
                <p className="font-semibold">{selectedTutor.name}</p>
              </div>

              <div className="pb-3 border-b">
                <p className="text-gray-600 text-xs">Subject</p>
                <p className="font-semibold">{selectedSubject}</p>
              </div>

              <div className="pb-3 border-b">
                <p className="text-gray-600 text-xs">Lesson Type</p>
                <p className="font-semibold">{selectedLessonType === "one_to_one" ? "One-on-One" : "Group (Max 5)"}</p>
              </div>

              <div className="pb-3 border-b">
                <p className="text-gray-600 text-xs">Date</p>
                <p className="font-semibold">{selectedDate || "Not selected"}</p>
              </div>

              <div className="pb-3 border-b">
                <p className="text-gray-600 text-xs">Time</p>
                <p className="font-semibold">{selectedSlot || "Not selected"}</p>
              </div>

              {selectedChild && (
                <div className="pb-3 border-b">
                  <p className="text-gray-600 text-xs">Student</p>
                  <p className="font-semibold">{selectedChild.name}</p>
                </div>
              )}

              <div className="pt-3 bg-blue-50 rounded p-3">
                <p className="text-gray-600 text-xs mb-1">Total Price</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice)}</p>
                <p className="text-xs text-gray-600 mt-1">£{price}/hr × 2 hours</p>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={!selectedDate || !selectedSlot || !selectedChild}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 font-bold transition-all disabled:cursor-not-allowed"
              >
                Confirm & Pay
              </button>
            </div>
          </div>

          {/* Middle: Calendar */}
          <div className="lg:col-span-1 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-gray-600">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((day, i) => {
                const dateStr = day.isCurrentMonth ? getDateString(day.date) : "";
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={i}
                    onClick={() => day.isCurrentMonth && setSelectedDate(dateStr)}
                    disabled={!day.isCurrentMonth}
                    className={`aspect-square flex items-center justify-center rounded text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : day.isCurrentMonth
                        ? "border border-gray-300 hover:border-blue-500 text-gray-900 hover:bg-blue-50"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {day.date}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Time Slots */}
          <div className="lg:col-span-1 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="font-bold mb-4">Available Time Slots</h3>
            {selectedDate ? (
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full p-3 border-2 rounded-lg transition-all text-left font-medium ${
                      selectedSlot === slot
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-300 hover:border-blue-300 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{slot}</span>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Available</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p className="text-sm">Select a date to see available slots</p>
              </div>
            )}

            {children.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-bold mb-3 text-sm">Assign to Student</h4>
                <select
                  value={selectedChild?.id || ""}
                  onChange={(e) => {
                    const child = children.find((c) => c.id === e.target.value);
                    setSelectedChild(child || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select a child</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Child Prompt */}
      {children.length === 0 && (
        <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 text-center">
          <p className="text-gray-700 mb-3">You need to add a child before booking a lesson</p>
          <a
            href="/parent/children?action=add"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Add Child →
          </a>
        </div>
      )}
    </div>
  );
}
