import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

export default async function AdminDeckFlashcardsRedirectPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = await params
  if (!deckId?.trim()) {
    redirect('/admin/flashcards')
  }

  await requireAdmin()

  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    select: { id: true, slug: true, parentDeckId: true },
  })

  if (!deck) {
    redirect('/admin/flashcards')
  }

  const qs = new URLSearchParams()
  qs.set('view', 'all')

  if (deck.parentDeckId) {
    qs.set('mainDeckId', deck.parentDeckId)
    qs.set('deckSlug', deck.slug)
  } else {
    qs.set('mainDeckId', deck.id)
  }

  redirect(`/admin/flashcards?${qs.toString()}`)
}
