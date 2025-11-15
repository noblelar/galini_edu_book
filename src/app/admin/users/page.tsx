"use client";
import { useEffect, useState } from "react";
import { LocalDB } from "@/lib/booking/storage";
import { User, UserRole } from "@/lib/booking/types";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [formData, setFormData] = useState<Partial<User>>({
    email: "",
    name: "",
    role: "parent",
    phone: "",
    verified: false,
    active: true,
  });

  useEffect(() => {
    const allUsers = LocalDB.getAllUsers();
    setUsers(allUsers);
    setLoading(false);
  }, []);

  const handleAddUser = () => {
    setEditingId(null);
    setFormData({
      email: "",
      name: "",
      role: "parent",
      phone: "",
      verified: false,
      active: true,
    });
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingId(user.id);
    setFormData(user);
    setShowForm(true);
  };

  const handleSaveUser = () => {
    if (!formData.email || !formData.name) {
      alert("Please fill in required fields");
      return;
    }

    if (editingId) {
      const updated = LocalDB.updateUser(editingId, formData);
      if (updated) {
        setUsers(users.map((u) => (u.id === editingId ? updated : u)));
      }
    } else {
      const created = LocalDB.createUser(formData as Omit<User, "id" | "createdAt" | "updatedAt">);
      setUsers([...users, created]);
    }
    setShowForm(false);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      if (LocalDB.deleteUser(id)) {
        setUsers(users.filter((u) => u.id !== id));
      }
    }
  };

  const handleToggleStatus = (user: User) => {
    const updated = LocalDB.updateUser(user.id, { active: !user.active });
    if (updated) {
      setUsers(users.map((u) => (u.id === user.id ? updated : u)));
    }
  };

  const filteredUsers = filterRole === "all" ? users : users.filter((u) => u.role === filterRole);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users in the system</p>
        </div>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as UserRole | "all")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="tutor">Tutor</option>
          <option value="parent">Parent</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Role</th>
                <th className="text-left py-3 px-4 font-semibold">Phone</th>
                <th className="text-left py-3 px-4 font-semibold">Verified</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.phone || "-"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {user.verified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-2 py-1 rounded text-xs font-medium ${user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-8 text-center text-gray-600">No users found</div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit User" : "Add New User"}</h2>

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
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  value={formData.role || "parent"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="tutor">Tutor</option>
                  <option value="parent">Parent</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+44 123 4567890"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.verified || false}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Email Verified</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active !== false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active</span>
                </label>
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
                onClick={handleSaveUser}
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
