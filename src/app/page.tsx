import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans dark:bg-black">
      <header className="sticky top-0 z-50 border-b border-black/[.08] bg-white/60 backdrop-blur dark:border-white/[.145] dark:bg-black/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-16">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#4586F7] to-[#570DF8]">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-lg font-bold text-black dark:text-white">LessonsUK</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-black dark:text-white">
              Home
            </Link>
            <Link
              href="/book"
              className="rounded-lg bg-[#570DF8] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4506b8]"
            >
              Book Now
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-r from-[#4586F7]/10 via-transparent to-[#570DF8]/10 px-6 py-20 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50 lg:text-6xl lg:leading-tight">
              Expert Tutoring for UK Students
            </h1>
            <p className="mt-6 text-lg leading-7 text-zinc-600 dark:text-zinc-400 lg:text-xl lg:leading-8">
              Quality education delivered one lesson at a time. Choose between personalized one-on-one lessons or group classes tailored to your learning pace.
            </p>
            <Link
              href="/book"
              className="mt-8 inline-flex h-14 items-center justify-center rounded-lg bg-[#570DF8] px-8 text-base font-semibold text-white transition-colors hover:bg-[#4506b8]"
            >
              Book Your First Lesson
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50/40 px-6 py-20 dark:bg-zinc-900/20 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-black dark:text-white">
              Flexible Pricing for Every Budget
            </h2>
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
              All lessons are scheduled in 2-hour blocks for maximum learning efficiency
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-black">
              <div className="flex items-start gap-4">
                <svg className="h-6 w-6 flex-shrink-0 text-[#570DF8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.42 10.922c.179-.08.331-.21.437-.374a.996.996 0 00-.179-1.321 1.003 1.003 0 00-.457-.364L12.83 5.18a2.99 2.99 0 00-1.66 0L2.6 9.08a.999.999 0 00.181 1.832l8.57 3.9a2.99 2.99 0 001.66 0l8.59-3.898zM22 10v6M6 12.5V16c0 .796.632 1.559 1.757 2.121C8.883 18.684 10.409 19 12 19s3.117-.316 4.243-.879C17.368 17.559 18 16.796 18 16v-3.5"/>
                </svg>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black dark:text-white">One-on-One</h3>
                  <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-400">
                    Personalized attention from an expert tutor
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-black dark:text-white">£30</span>
                  <span className="text-base text-zinc-600 dark:text-zinc-400">/hour</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-[#570DF8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  <span className="text-base text-black dark:text-white">Customized lesson plan</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-[#570DF8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  <span className="text-base text-black dark:text-white">Flexible scheduling</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-[#570DF8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  <span className="text-base text-black dark:text-white">One-to-one support</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-[#570DF8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  <span className="text-base text-black dark:text-white">2-hour session blocks</span>
                </li>
              </ul>

              <Link
                href="/book"
                className="mt-8 block rounded-lg border border-[#570DF8] py-3 text-center text-sm font-semibold text-[#570DF8] transition-colors hover:bg-[#570DF8]/5"
              >
                Book One-on-One
              </Link>
            </div>

            <div className="relative rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-black">
              <div className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-[#570DF8] px-4 py-1 text-xs font-bold text-white">
                POPULAR
              </div>

              <div className="flex items-start gap-4">
                <svg className="h-6 w-6 flex-shrink-0 text-[#4586F7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M16 3.128a4.002 4.002 0 010 7.744M22 21v-2a4 4 0 00-3-3.87M9 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black dark:text-white">Group Classes</h3>
                  <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-400">
                    Learn together with up to 5 students
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-black dark:text-white">£20</span>
                  <span className="text-base text-zinc-600 dark:text-zinc-400">/hour per person</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-[#4586F7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  <span className="text-base text-black dark:text-white">Learn with peers</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-[#4586F7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  <span className="text-base text-black dark:text-white">Maximum 5 students</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-[#4586F7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  <span className="text-base text-black dark:text-white">Collaborative learning</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-6 w-6 flex-shrink-0 text-[#4586F7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  <span className="text-base text-black dark:text-white">2-hour session blocks</span>
                </li>
              </ul>

              <Link
                href="/book"
                className="mt-8 block rounded-lg bg-[#4586F7] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#3670d6]"
              >
                Book Group Class
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-bold text-black dark:text-white">
            How It Works
          </h2>

          <div className="mt-16 grid gap-12 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#570DF8]/10">
                <span className="text-xl font-bold text-[#570DF8]">1</span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-black dark:text-white">
                Choose Your Lesson
              </h3>
              <p className="mt-3 text-base leading-6 text-zinc-600 dark:text-zinc-400">
                Select between one-on-one tutoring or group classes that fit your needs and budget.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#4586F7]/10">
                <span className="text-xl font-bold text-[#4586F7]">2</span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-black dark:text-white">
                Pick Your Time
              </h3>
              <p className="mt-3 text-base leading-6 text-zinc-600 dark:text-zinc-400">
                Choose from available 2-hour time slots that work for your schedule.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#570DF8]/10">
                <span className="text-xl font-bold text-[#570DF8]">3</span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-black dark:text-white">
                Start Learning
              </h3>
              <p className="mt-3 text-base leading-6 text-zinc-600 dark:text-zinc-400">
                Connect with your tutor and begin your journey to educational success.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50/40 px-6 py-20 dark:bg-zinc-900/20 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-bold text-black dark:text-white">
            Why Choose LessonsUK
          </h2>

          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            <div className="flex gap-4">
              <svg className="h-6 w-6 flex-shrink-0 text-[#570DF8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
              </svg>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Efficient Sessions
                </h3>
                <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-400">
                  Every lesson is a focused 2-hour block designed to maximize learning outcomes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <svg className="h-6 w-6 flex-shrink-0 text-[#570DF8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.42 10.922c.179-.08.331-.21.437-.374a.996.996 0 00-.179-1.321 1.003 1.003 0 00-.457-.364L12.83 5.18a2.99 2.99 0 00-1.66 0L2.6 9.08a.999.999 0 00.181 1.832l8.57 3.9a2.99 2.99 0 001.66 0l8.59-3.898zM22 10v6M6 12.5V16c0 .796.632 1.559 1.757 2.121C8.883 18.684 10.409 19 12 19s3.117-.316 4.243-.879C17.368 17.559 18 16.796 18 16v-3.5"/>
              </svg>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Expert Tutors
                </h3>
                <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-400">
                  Qualified educators passionate about helping UK students succeed.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <svg className="h-6 w-6 flex-shrink-0 text-[#4586F7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M16 3.128a4.002 4.002 0 010 7.744M22 21v-2a4 4 0 00-3-3.87M9 11a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Flexible Options
                </h3>
                <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-400">
                  Choose between personalized one-on-one or collaborative group learning.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <svg className="h-6 w-6 flex-shrink-0 text-[#4586F7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
              </svg>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Affordable Pricing
                </h3>
                <p className="mt-2 text-base leading-6 text-zinc-600 dark:text-zinc-400">
                  Quality education at reasonable prices for families across the UK.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-black dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg leading-7 text-zinc-600 dark:text-zinc-400">
            Book your first lesson today and give your child the educational support they deserve.
          </p>
          <Link
            href="/book"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-lg bg-[#570DF8] px-8 text-base font-semibold text-white transition-colors hover:bg-[#4506b8]"
          >
            Book Your Lesson Now
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-900/20">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-3">
            <div>
              <h3 className="text-base font-semibold text-black dark:text-white">LessonsUK</h3>
              <p className="mt-4 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
                Professional tutoring for UK students, delivered with excellence.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-black dark:text-white">Services</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>One-on-One Lessons</li>
                <li>Group Classes</li>
                <li>Flexible Scheduling</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-black dark:text-white">Contact</h3>
              <p className="mt-4 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
                Ready to get started?
                <br />
                Book your first lesson today.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800 lg:flex-row">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              © 2024 LessonsUK. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <a href="#" className="hover:text-black dark:hover:text-white">Privacy</a>
              <a href="#" className="hover:text-black dark:hover:text-white">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
