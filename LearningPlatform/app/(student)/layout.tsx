import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {children}
      </main>
    </>
  );
}
