"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentDB, StudentHomework } from "@/lib/booking/student-storage";

type FilterType = "all" | "pending" | "completed" | "overdue";

export default function StudentHomework() {
  const [homework, setHomework] = useState<StudentHomework[]>([]);
  const [filteredHomework, setFilteredHomework] = useState<StudentHomework[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId] = useState("student_demo_001");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const allHomework = StudentDB.getHomeworkByStudent(studentId);

    // Add demo homework if none exist
    if (allHomework.length === 0) {
      const demoHomework = [
        {
          title: "Solve Algebraic Equations",
          description: "Complete the worksheet on solving linear equations",
          subject: "Math",
          tutorId: "tutor_001",
          tutorName: "John Smith",
          dueDate: "2024-01-20",
          status: "pending" as const,
          instructions: "Complete all 20 problems on page 45-47. Show all working. Submit as PDF or photo.",
        },
        {
          title: "Essay on Shakespeare",
          description: "Write a 500-word essay on Macbeth",
          subject: "English",
          tutorId: "tutor_002",
          tutorName: "Jane Doe",
          dueDate: "2024-01-18",
          status: "overdue" as const,
          instructions: "Write about the themes of ambition in Macbeth. Include at least 3 quotes from the text.",
        },
        {
          title: "Biology Lab Report",
          description: "Report on cell structure observation",
          subject: "Science",
          tutorId: "tutor_003",
          tutorName: "Dr. Green",
          dueDate: "2024-01-25",
          status: "pending" as const,
          instructions: "Document your observations from the microscope activity. Include diagrams and conclusions.",
        },
        {
          title: "History Timeline Project",
          description: "Create a visual timeline of WWII events",
          subject: "History",
          tutorId: "tutor_004",
          tutorName: "Mr. Brown",
          dueDate: "2024-01-22",
          status: "pending" as const,
          instructions: "Create a timeline with at least 10 major events. Include dates, descriptions, and images.",
        },
        {
          title: "Math Quiz Corrections",
          description: "Redo problems you got wrong",
          subject: "Math",
          tutorId: "tutor_001",
          tutorName: "John Smith",
          dueDate: "2024-01-15",
          status: "completed" as const,
          instructions: "Redo problems 5, 8, and 12 with correct working shown.",
          submissionDate: "2024-01-15",
          tutorFeedback: "Great improvement! Well done.",
          tutorFeedbackDate: "2024-01-16",
        },
      ];

      demoHomework.forEach((hw) => {
        StudentDB.addHomework({
          ...hw,
          studentId,
        });
      });

      setHomework(demoHomework.map((h) => ({ ...h, studentId, id: "", createdAt: new Date().toISOString() })));
    } else {
      setHomework(allHomework);
    }

    const uniqueSubjects = Array.from(new Set(allHomework.map((h) => h.subject)));
    setSubjects(uniqueSubjects);

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    let filtered = homework;

    if (filterType === "pending") {
      filtered = filtered.filter((h) => h.status === "pending");
    } else if (filterType === "completed") {
      filtered = filtered.filter((h) => h.status === "completed");
    } else if (filterType === "overdue") {
      filtered = filtered.filter((h) => h.status === "overdue");
    }

    if (filterSubject) {
      filtered = filtered.filter((h) => h.subject === filterSubject);
    }

    setFilteredHomework(filtered);
  }, [homework, filterType, filterSubject]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const pendingCount = homework.filter((h) => h.status === "pending").length;
  const overdueCount = homework.filter((h) => h.status === "overdue").length;
  const completedCount = homework.filter((h) => h.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ✏️ My Homework
        </h1>
        <p className="text-gray-600 mt-2">Track and submit your assignments</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-yellow-300 rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-amber-50">
          <p className="text-sm font-medium text-yellow-900 uppercase tracking-wide">Pending</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">{pendingCount}</p>
          <p className="text-xs text-yellow-800 mt-1">assignments to submit</p>
        </div>
        <div className="border border-red-300 rounded-lg p-6 bg-gradient-to-br from-red-50 to-pink-50">
          <p className="text-sm font-medium text-red-900 uppercase tracking-wide">Overdue</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{overdueCount}</p>
          <p className="text-xs text-red-800 mt-1">urgent attention needed</p>
        </div>
        <div className="border border-green-300 rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50">
          <p className="text-sm font-medium text-green-900 uppercase tracking-wide">Completed</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{completedCount}</p>
          <p className="text-xs text-green-800 mt-1">well done!</p>
        </div>
      </div>

      {/* Filters */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <div className="flex gap-2 flex-wrap">
              {(["all", "pending", "overdue", "completed"] as FilterType[]).map((type) => (
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

      {/* Homework List */}
      <div className="space-y-4">
        {filteredHomework.length > 0 ? (
          filteredHomework.map((hw) => (
            <Link
              key={hw.id}
              href={`/student/homework/${hw.id}`}
              className="block border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{hw.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(hw.status)}`}>
                      {hw.status.charAt(0).toUpperCase() + hw.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{hw.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Subject</p>
                      <p className="font-semibold text-gray-900 mt-1">📚 {hw.subject}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tutor</p>
                      <p className="font-semibold text-gray-900 mt-1">👨‍🏫 {hw.tutorName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Due Date</p>
                      <p className={`font-semibold mt-1 ${isDueToday(hw.dueDate) ? "text-red-600" : "text-gray-900"}`}>
                        📅 {hw.dueDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Days Left</p>
                      <p className={`font-semibold mt-1 ${getDaysLeft(hw.dueDate) <= 0 ? "text-red-600" : "text-gray-900"}`}>
                        ⏳ {getDaysLeft(hw.dueDate) > 0 ? `${getDaysLeft(hw.dueDate)} days` : "Overdue"}
                      </p>
                    </div>
                  </div>

                  {hw.tutorFeedback && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-900">
                        <strong>✅ Feedback:</strong> {hw.tutorFeedback}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col gap-2">
                  <div className="text-blue-600 font-semibold">
                    View Details →
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 text-lg mb-2">No homework found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h2 className="text-lg font-bold text-blue-900 mb-3">💡 Tips for Success</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Start assignments early to have time for questions</li>
          <li>✓ Follow instructions carefully and ask if unclear</li>
          <li>✓ Submit before the deadline for full credit</li>
          <li>✓ Review tutor feedback to improve future work</li>
        </ul>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    submitted: "bg-blue-100 text-blue-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

function isDueToday(dueDate: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dueDate === today;
}

function getDaysLeft(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
