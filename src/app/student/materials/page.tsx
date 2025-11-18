"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentDB, StudentMaterial } from "@/lib/booking/student-storage";
import { useSearchParams } from "next/navigation";

type CategoryType = "worksheet" | "video" | "pdf" | "presentation" | "image" | "document" | "assignment";

export default function StudentMaterials() {
  const searchParams = useSearchParams();
  const lessonFilter = searchParams.get("lesson") || "";

  const [materials, setMaterials] = useState<StudentMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudentMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId] = useState("student_demo_001");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);

  const categories: CategoryType[] = [
    "worksheet",
    "video",
    "pdf",
    "presentation",
    "image",
    "document",
    "assignment",
  ];

  useEffect(() => {
    const allMaterials = StudentDB.getMaterialsByStudent(studentId);

    // Add some demo materials if none exist
    if (allMaterials.length === 0) {
      const demoMaterials = [
        {
          name: "Algebra Basics Worksheet",
          description: "Introduction to algebraic equations",
          subject: "Math",
          category: "worksheet" as CategoryType,
          tutorId: "tutor_001",
          tutorName: "John Smith",
          fileUrl: "/sample.pdf",
          fileType: "pdf",
        },
        {
          name: "Shakespeare Documentary",
          description: "Life and works of William Shakespeare",
          subject: "English",
          category: "video" as CategoryType,
          tutorId: "tutor_002",
          tutorName: "Jane Doe",
          fileUrl: "/sample.mp4",
          fileType: "video",
        },
        {
          name: "Cell Division Notes",
          description: "Detailed notes on cell division and mitosis",
          subject: "Science",
          category: "document" as CategoryType,
          tutorId: "tutor_003",
          tutorName: "Dr. Green",
          fileUrl: "/sample.pdf",
          fileType: "pdf",
        },
        {
          name: "History Presentation",
          description: "World War II timeline and key events",
          subject: "History",
          category: "presentation" as CategoryType,
          tutorId: "tutor_004",
          tutorName: "Mr. Brown",
          fileUrl: "/sample.pptx",
          fileType: "pptx",
        },
      ];

      demoMaterials.forEach((material) => {
        StudentDB.addMaterial({
          ...material,
          studentId,
        });
      });

      setMaterials(demoMaterials.map((m) => ({ ...m, studentId, id: "", createdAt: new Date().toISOString() })));
    } else {
      setMaterials(allMaterials);
    }

    const uniqueSubjects = Array.from(new Set(allMaterials.map((m) => m.subject)));
    setSubjects(uniqueSubjects);

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    let filtered = materials;

    if (filterSubject) {
      filtered = filtered.filter((m) => m.subject === filterSubject);
    }

    if (filterCategory) {
      filtered = filtered.filter((m) => m.category === filterCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.tutorName.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  }, [materials, filterSubject, filterCategory, searchQuery]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      worksheet: "📄",
      video: "🎬",
      pdf: "📕",
      presentation: "🎯",
      image: "🖼️",
      document: "📖",
      assignment: "✏️",
    };
    return icons[category] || "📁";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      worksheet: "from-blue-50 to-cyan-50 border-blue-200",
      video: "from-purple-50 to-pink-50 border-purple-200",
      pdf: "from-red-50 to-orange-50 border-red-200",
      presentation: "from-yellow-50 to-amber-50 border-yellow-200",
      image: "from-green-50 to-emerald-50 border-green-200",
      document: "from-indigo-50 to-blue-50 border-indigo-200",
      assignment: "from-pink-50 to-rose-50 border-pink-200",
    };
    return colors[category] || "from-gray-50 to-gray-100 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📚 Learning Materials
        </h1>
        <p className="text-gray-600 mt-2">Download worksheets, videos, and resources for your lessons</p>
      </div>

      {/* Search and Filters */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Materials</label>
            <input
              type="text"
              placeholder="Search by name, subject, or tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filterSubject || filterCategory || searchQuery) && (
            <button
              onClick={() => {
                setFilterSubject("");
                setFilterCategory("");
                setSearchQuery("");
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Materials Grid */}
      <div>
        {filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className={`border rounded-lg p-6 bg-gradient-to-br ${getCategoryColor(material.category)} shadow-sm hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getCategoryIcon(material.category)}</div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                    {material.category}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{material.name}</h3>

                {material.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{material.description}</p>
                )}

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span>📚</span>
                    <span>{material.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span>👨‍🏫</span>
                    <span>{material.tutorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <span>📅</span>
                    <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-300">
                  <a
                    href={material.fileUrl}
                    download
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm text-center"
                  >
                    📥 Download
                  </a>
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm text-center"
                  >
                    👁️ Preview
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 text-lg mb-2">No materials found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later for new materials</p>
          </div>
        )}
      </div>

      {/* Materials by Category Summary */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">📊 Materials Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const count = materials.filter((m) => m.category === category).length;
            return (
              <div key={category} className="text-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="text-3xl mb-2">{getCategoryIcon(category)}</div>
                <p className="font-semibold text-gray-900 text-lg">{count}</p>
                <p className="text-xs text-gray-600 capitalize mt-1">
                  {category}{count !== 1 ? "s" : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
