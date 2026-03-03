import { redirect } from 'next/navigation'
export default function AdminSettingsRedirect() {
  redirect('/dashboard/flashcards/settings')
}
