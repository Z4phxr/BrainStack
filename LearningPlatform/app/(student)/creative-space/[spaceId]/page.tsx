import { CreativeSpaceBoardWithSurface } from '@/components/student/creative-space-board-with-surface'

export const dynamic = 'force-dynamic'

export default async function CreativeSpaceBoardPage({
  params,
}: {
  params: Promise<{ spaceId: string }>
}) {
  const { spaceId } = await params
  return <CreativeSpaceBoardWithSurface spaceId={spaceId} />
}
