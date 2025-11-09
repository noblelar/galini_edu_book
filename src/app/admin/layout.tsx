export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[220px_1fr] lg:px-16">
        <aside className="rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-black">
          <h2 className="px-2 text-sm font-semibold">Admin</h2>
          <nav className="mt-4 grid gap-1 text-sm">
            <a className="rounded-md px-2 py-2 hover:bg-black/[.03] dark:hover:bg-[#111]" href="/admin">Dashboard</a>
            <a className="rounded-md px-2 py-2 hover:bg-black/[.03] dark:hover:bg-[#111]" href="/admin/users">Users</a>
            <a className="rounded-md px-2 py-2 hover:bg-black/[.03] dark:hover:bg-[#111]" href="/admin/tutors">Tutors</a>
            <a className="rounded-md px-2 py-2 hover:bg-black/[.03] dark:hover:bg-[#111]" href="/admin/bookings">Bookings</a>
            <a className="rounded-md px-2 py-2 hover:bg-black/[.03] dark:hover:bg-[#111]" href="/admin/subjects">Subjects</a>
            <a className="rounded-md px-2 py-2 hover:bg-black/[.03] dark:hover:bg-[#111]" href="/admin/payments">Payments</a>
            <a className="rounded-md px-2 py-2 hover:bg-black/[.03] dark:hover:bg-[#111]" href="/admin/reports">Reports</a>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
