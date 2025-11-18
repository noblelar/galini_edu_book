"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentDB, StudentProgress, StudentHomework, StudentLesson } from "@/lib/booking/student-storage";

export default function StudentProgress() {
  const [progressEntries, setProgressEntries] = useState<StudentProgress[]>([]);
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [homework, setHomework] = useState<StudentHomework[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId] = useState("student_demo_001");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const allProgress = StudentDB.getProgressByStudent(studentId);
    const allLessons = StudentDB.getLessonsByStudent(studentId);
    const allHomework = StudentDB.getHomeworkByStudent(studentId);

    // Add demo progress if none exist
    if (allProgress.length === 0) {
      const demoProgress = [
        {
          studentId,
          tutorId: "tutor_001",
          tutorName: "John Smith",
          subject: "Math",
          lessonDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          topicsCovered: ["Quadratic Equations", "Factoring"],
          notes: "Good understanding of factoring. Work on simplifying fractions.",
          feedback: "You're making excellent progress! Keep practicing the harder problems.",
        },
        {
          studentId,
          tutorId: "tutor_002",
          tutorName: "Jane Doe",
          subject: "English",
          lessonDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          topicsCovered: ["Essay Writing", "Character Analysis"],
          notes: "Strong essay structure. Could improve vocabulary usage.",
          feedback: "Your analysis of the main character was insightful. Well done!",
        },
        {
          studentId,
          tutorId: "tutor_003",
          tutorName: "Dr. Green",
          subject: "Science",
          lessonDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          topicsCovered: ["Cell Division", "Mitosis"],
          notes: "Understood the concept but needs practice with diagrams.",
          feedback: "Great questions in today's lesson! You're really thinking critically.",
        },
        {
          studentId,
          tutorId: "tutor_001",
          tutorName: "John Smith",
          subject: "Math",
          lessonDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          topicsCovered: ["Linear Equations", "Graphing"],
          notes: "Improving with linear equations. Keep up the practice.",
          feedback: "You've shown significant improvement since last month. Proud of you!",
        },
      ];

      demoProgress.forEach((progress) => {
        StudentDB.addProgressEntry({
          ...progress,
          createdAt: progress.lessonDate,
        });
      });

      setProgressEntries(demoProgress);
    } else {
      setProgressEntries(allProgress);
    }

    setLessons(allLessons);
    setHomework(allHomework);

    const uniqueSubjects = Array.from(new Set(allProgress.map((p) => p.subject)));
    setSubjects(uniqueSubjects);

    setLoading(false);
  }, [studentId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const filteredProgress = selectedSubject
    ? progressEntries.filter((p) => p.subject === selectedSubject)
    : progressEntries;

  // Calculate stats
  const completedLessons = lessons.filter((l) => l.status === "completed").length;
  const totalLessons = lessons.length;
  const completedHomework = homework.filter((h) => h.status === "completed").length;
  const totalHomework = homework.length;
  const homeworkCompletion = totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0;
  const lessonCompletion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Subject breakdown
  const subjectStats = subjects.map((subject) => {
    const subjectProgress = progressEntries.filter((p) => p.subject === subject);
    const subjectLessons = lessons.filter((l) => l.subject === subject);
    const completed = subjectLessons.filter((l) => l.status === "completed").length;
    const percentage = subjectLessons.length > 0 ? Math.round((completed / subjectLessons.length) * 100) : 0;

    return {
      subject,
      lessonsCount: subjectLessons.length,
      completedCount: completed,
      percentage,
      latestFeedback: subjectProgress[0]?.feedback || "",
    };
  });

  // Recent topics
  const recentTopics = filteredProgress.slice(0, 5).flatMap((p) => p.topicsCovered);
  const topicCounts: Record<string, number> = {};
  recentTopics.forEach((topic) => {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📊 My Progress
        </h1>
        <p className="text-gray-600 mt-2">Track your learning journey and academic growth</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Lessons Completed"
          value={`${completedLessons}/${totalLessons}`}
          percentage={lessonCompletion}
          icon="📚"
          color="blue"
        />
        <StatCard
          title="Homework Completion"
          value={`${completedHomework}/${totalHomework}`}
          percentage={homeworkCompletion}
          icon="✏️"
          color="purple"
        />
        <StatCard
          title="Learning Days"
          value={filteredProgress.length.toString()}
          subtitle="progress entries"
          icon="📅"
          color="green"
        />
        <StatCard
          title="Subjects Learning"
          value={subjects.length.toString()}
          subtitle="active subjects"
          icon="🎓"
          color="pink"
        />
      </div>

      {/* Subject Performance */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">📚 Subject Performance</h2>

        <div className="space-y-4">
          {subjectStats.map((stat) => (
            <div key={stat.subject} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{stat.subject}</h3>
                <span className="text-lg font-bold text-blue-600">{stat.percentage}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="text-gray-600">Lessons Completed</p>
                  <p className="font-semibold text-gray-900">
                    {stat.completedCount}/{stat.lessonsCount}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Average Progress</p>
                  <p className="font-semibold text-gray-900">Good</p>
                </div>
              </div>

              {stat.latestFeedback && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Latest feedback:</strong> {stat.latestFeedback.substring(0, 100)}...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Filter */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-3">View Progress by Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
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

      {/* Recent Progress Entries */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">📝 Recent Progress Entries</h2>
          <p className="text-sm text-gray-600">{filteredProgress.length} entries</p>
        </div>

        <div className="space-y-4">
          {filteredProgress.length > 0 ? (
            filteredProgress.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{entry.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">👨‍🏫 {entry.tutorName}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {new Date(entry.lessonDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {entry.topicsCovered.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {entry.notes && (
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 mb-3">
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {entry.notes}
                    </p>
                  </div>
                )}

                {entry.feedback && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-900">
                      <strong>✅ Feedback:</strong> {entry.feedback}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>No progress entries yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Topics Mastery */}
      {Object.keys(topicCounts).length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">🎯 Topics You're Studying</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(topicCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([topic, count]) => (
                <div
                  key={topic}
                  className="p-4 border border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 text-center"
                >
                  <p className="font-semibold text-gray-900 mb-1">{topic}</p>
                  <p className="text-2xl font-bold text-purple-600">{count}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {count === 1 ? "lesson" : "lessons"}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Goals & Next Steps */}
      <div className="border border-blue-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h2 className="text-lg font-bold text-blue-900 mb-3">🎯 Next Steps to Improve</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Complete pending homework assignments for better understanding</li>
          <li>✓ Review tutor feedback and practice recommended topics</li>
          <li>✓ Attend all scheduled lessons to build consistent progress</li>
          <li>✓ Ask questions when you don't understand concepts</li>
          <li>✓ Download and study materials shared by tutors</li>
        </ul>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/student/lessons"
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all text-center"
        >
          <div className="text-3xl mb-2">📚</div>
          <p className="font-semibold text-gray-900">View Lessons</p>
          <p className="text-xs text-gray-600 mt-1">Continue with your lessons</p>
        </Link>
        <Link
          href="/student/homework"
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all text-center"
        >
          <div className="text-3xl mb-2">✏️</div>
          <p className="font-semibold text-gray-900">Complete Homework</p>
          <p className="text-xs text-gray-600 mt-1">Work on pending assignments</p>
        </Link>
        <Link
          href="/student/materials"
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all text-center"
        >
          <div className="text-3xl mb-2">📖</div>
          <p className="font-semibold text-gray-900">Download Materials</p>
          <p className="text-xs text-gray-600 mt-1">Access study resources</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  percentage,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string;
  percentage?: number;
  subtitle?: string;
  icon: string;
  color: "blue" | "green" | "purple" | "pink";
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-50 to-cyan-50 border-blue-200",
    green: "from-green-50 to-emerald-50 border-green-200",
    purple: "from-purple-50 to-pink-50 border-purple-200",
    pink: "from-pink-50 to-rose-50 border-pink-200",
  };

  const textClasses: Record<string, string> = {
    blue: "text-blue-900",
    green: "text-green-900",
    purple: "text-purple-900",
    pink: "text-pink-900",
  };

  const progressColor: Record<string, string> = {
    blue: "from-blue-600 to-cyan-600",
    green: "from-green-600 to-emerald-600",
    purple: "from-purple-600 to-pink-600",
    pink: "from-pink-600 to-rose-600",
  };

  return (
    <div className={`border rounded-lg p-5 bg-gradient-to-br ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`text-sm font-medium ${textClasses[color]}`}>{title}</p>
          <p className={`text-3xl font-bold mt-2 ${textClasses[color]}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-2 ${textClasses[color]}`}>{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>

      {percentage !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <p className={`text-xs font-medium ${textClasses[color]}`}>Progress</p>
            <p className={`text-sm font-bold ${textClasses[color]}`}>{percentage}%</p>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className={`bg-gradient-to-r ${progressColor[color]} h-2 rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
