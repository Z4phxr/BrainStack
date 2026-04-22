import { Navbar } from '@/components/navbar'

export default function StudentShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-dvh w-full">
      <div className="student-app-shell-bg" aria-hidden />
      <div className="student-app-shell">
        <Navbar />
        <main className="pt-[4.5rem] text-base leading-relaxed sm:pt-[4.75rem]">{children}</main>
      </div>
    </div>
  )
}
