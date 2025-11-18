import Link from "next/link";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900">
      <div className="flex h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full bg-white border-b lg:border-b-0 lg:border-r border-gray-200 lg:w-72 lg:fixed lg:h-screen lg:overflow-y-auto shadow-sm">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                ✨
              </div>
              <div>
                <h1 className="font-bold text-lg text-blue-600">LessonUK</h1>
                <p className="text-xs text-gray-600">Student Portal</p>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="space-y-2">
              <NavLink href="/student" label="Dashboard" icon="🏠" />
              <NavLink href="/student/lessons" label="Lessons" icon="📚" />
              <NavLink href="/student/materials" label="Materials" icon="📁" />
              <NavLink href="/student/homework" label="Homework" icon="✏️" />
              <NavLink href="/student/announcements" label="Announcements" icon="📢" />
              <NavLink href="/student/messages" label="Messages" icon="💬" />
              <NavLink href="/student/progress" label="Progress" icon="📊" />
              <NavLink href="/student/attendance" label="Attendance" icon="✅" />
              <NavLink href="/student/profile" label="Profile" icon="👤" />
              <NavLink href="/student/settings" label="Settings" icon="⚙️" />
            </nav>
          </div>

          {/* Help Card */}
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border border-blue-300">
            <p className="text-sm font-medium text-blue-900 mb-2">📖 Need Help?</p>
            <p className="text-xs text-blue-800 mb-3">Check your materials or ask your tutor!</p>
            <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium">
              Contact Tutor
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 overflow-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-600 transition-all font-medium group"
    >
      <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
