import Link from "next/link";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full bg-white border-b lg:border-b-0 lg:border-r border-gray-200 lg:w-64 lg:fixed lg:h-screen lg:overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                📚
              </div>
              <div>
                <h1 className="font-bold text-lg text-blue-600">LessonUK</h1>
                <p className="text-xs text-gray-600">Tutor Portal</p>
              </div>
            </div>

            <nav className="space-y-2">
              <NavLink href="/tutor" label="Dashboard" icon="📊" />
              <NavLink href="/tutor/lessons" label="Lessons" icon="📖" />
              <NavLink href="/tutor/availability" label="Availability" icon="📅" />
              <NavLink href="/tutor/students" label="Students" icon="👥" />
              <NavLink href="/tutor/announcements" label="Announcements" icon="📢" />
              <NavLink href="/tutor/materials" label="Materials" icon="📁" />
              <NavLink href="/tutor/messages" label="Messages" icon="💬" />
              <NavLink href="/tutor/earnings" label="Earnings" icon="💰" />
              <NavLink href="/tutor/profile" label="Profile" icon="👤" />
              <NavLink href="/tutor/settings" label="Settings" icon="⚙️" />
            </nav>
          </div>

          <div className="absolute bottom-6 left-6 right-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">Need Help?</p>
            <p className="text-xs text-blue-800 mb-3">Check our documentation or contact support.</p>
            <button className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors font-medium">
              Get Support
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 overflow-auto">
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
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors font-medium"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
