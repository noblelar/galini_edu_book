"use client";
import { useEffect, useState } from "react";
import { TutorDB } from "@/lib/booking/tutor-storage";
import { LessonMaterial } from "@/lib/booking/types";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<LessonMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorId] = useState("tutor_demo_001");
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fileUrl: "",
    fileType: "pdf",
    category: "General",
  });

  useEffect(() => {
    const mats = TutorDB.getMaterialsByTutor(tutorId);
    setMaterials(mats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }, [tutorId]);

  const handleUploadMaterial = () => {
    if (!formData.name || !formData.fileUrl) {
      alert("Please fill in name and file URL");
      return;
    }

    const created = TutorDB.createMaterial({
      tutorId,
      name: formData.name,
      description: formData.description,
      fileUrl: formData.fileUrl,
      fileType: formData.fileType,
      category: formData.category,
    });

    setMaterials([created, ...materials]);
    setShowForm(false);
    setFormData({
      name: "",
      description: "",
      fileUrl: "",
      fileType: "pdf",
      category: "General",
    });
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm("Delete this material?")) {
      if (TutorDB.deleteMaterial(id)) {
        setMaterials(materials.filter((m) => m.id !== id));
      }
    }
  };

  const categories = Array.from(new Set(materials.map((m) => m.category || "General")));
  const filteredMaterials = filterCategory === "all" ? materials : materials.filter((m) => m.category === filterCategory);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return "📄";
      case "word":
        return "📝";
      case "video":
        return "🎥";
      case "image":
        return "🖼️";
      default:
        return "📎";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lesson Materials</h1>
          <p className="text-gray-600 mt-2">Upload and organize your teaching resources</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Upload Material
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Materials" value={materials.length.toString()} />
        <StatCard label="Categories" value={categories.length.toString()} />
        <StatCard label="Total Size" value={`${(materials.length * 5).toFixed(1)} MB`} />
      </div>

      {/* Filters */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === "all" ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterCategory === cat ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((material) => (
            <div key={material.id} className="border rounded-lg p-5 bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{getFileIcon(material.fileType)}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg break-words">{material.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(material.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMaterial(material.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  🗑️
                </button>
              </div>

              {material.category && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mb-3">
                  {material.category}
                </span>
              )}

              {material.description && (
                <p className="text-sm text-gray-700 mb-4">{material.description}</p>
              )}

              <div className="flex gap-2">
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 text-center font-medium"
                >
                  Download
                </a>
                <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 font-medium">
                  Share
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-600">
            <p className="text-lg">No materials yet</p>
            <p className="text-sm mt-2">Upload your first lesson material to get started</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Upload Material</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Material Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Algebra Worksheet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the material..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">File URL *</label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/file.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">File Type</label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="word">Word Document</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., General"
                  />
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
                onClick={handleUploadMaterial}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Upload
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
    <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <p className="text-sm font-medium text-blue-900">{label}</p>
      <p className="text-3xl font-bold text-blue-900 mt-2">{value}</p>
    </div>
  );
}
