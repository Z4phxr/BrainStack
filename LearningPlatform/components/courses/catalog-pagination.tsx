import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CatalogFilters } from '@/lib/courses-catalog'
import { COURSES_CATALOG_PAGE_SIZE, serializeCatalogQuery } from '@/lib/courses-catalog'

type CatalogPaginationProps = {
  filters: CatalogFilters
  totalDocs: number
}

export function CatalogPagination({ filters, totalDocs }: CatalogPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalDocs / COURSES_CATALOG_PAGE_SIZE))
  if (totalPages <= 1) return null

  const current = Math.min(filters.page, totalPages)
  const qs = (page: number) => {
    const s = serializeCatalogQuery({ ...filters, page }, page)
    return s ? `?${s}` : ''
  }

  const window = 2
  const pages: number[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= current - window && p <= current + window)) {
      pages.push(p)
    }
  }
  const condensed: (number | 'gap')[] = []
  let prev = 0
  for (const p of pages) {
    if (prev && p - prev > 1) condensed.push('gap')
    condensed.push(p)
    prev = p
  }

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Course catalog pagination"
    >
      {current <= 1 ? (
        <span className="rounded-md border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
          Previous
        </span>
      ) : (
        <Link
          href={`/courses${qs(current - 1)}`}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Previous
        </Link>
      )}
      {condensed.map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={`/courses${qs(item)}`}
            className={cn(
              'min-w-[2.5rem] rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors',
              item === current
                ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-600'
                : 'border-border bg-background hover:bg-accent hover:text-accent-foreground',
            )}
            aria-current={item === current ? 'page' : undefined}
          >
            {item}
          </Link>
        ),
      )}
      {current >= totalPages ? (
        <span className="rounded-md border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
          Next
        </span>
      ) : (
        <Link
          href={`/courses${qs(current + 1)}`}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Next
        </Link>
      )}
    </nav>
  )
}
