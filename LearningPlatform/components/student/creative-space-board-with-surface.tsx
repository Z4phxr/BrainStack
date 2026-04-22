'use client'

import { CreativeSpaceSurfaceProvider } from '@/components/student/creative-space-surface-context'
import { CreativeSpaceClient } from '@/components/student/creative-space-client'

/** Wraps the whiteboard so chrome (Light/Dark/Auto) and storage are scoped to this `spaceId` only. */
export function CreativeSpaceBoardWithSurface({ spaceId }: { spaceId: string }) {
  return (
    <CreativeSpaceSurfaceProvider key={spaceId} spaceId={spaceId}>
      <CreativeSpaceClient key={spaceId} spaceId={spaceId} />
    </CreativeSpaceSurfaceProvider>
  )
}
