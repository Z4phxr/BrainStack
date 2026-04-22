/**
 * Whiteboard only: fullscreen main, no navbar. Filesystem placement (outside `(shell)`)
 * guarantees this — not `x-pathname`, which is unreliable on client navigations / RSC.
 */
export default function CreativeSpaceBoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden bg-background">
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden text-base leading-relaxed">
        {children}
      </main>
    </div>
  )
}
