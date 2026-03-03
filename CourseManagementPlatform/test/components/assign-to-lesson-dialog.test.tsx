import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssignToLessonDialog } from '@/components/admin/assign-to-lesson-dialog'

// ─── Mock server action ────────────────────────────────────────────────────────

vi.mock('@/app/(admin)/admin/actions', () => ({
  assignTask: vi.fn().mockResolvedValue(undefined),
}))

// ─── Mock fetch ────────────────────────────────────────────────────────────────

const mockHierarchy = {
  courses: [
    {
      id: 'course-1',
      title: 'Mathematics',
      modules: [
        {
          id: 'module-1',
          title: 'Algebra',
          lessons: [
            { id: 'lesson-1', title: 'Introduction to Variables' },
            { id: 'lesson-2', title: 'Linear Equations' },
          ],
        },
        {
          id: 'module-2',
          title: 'Geometry',
          lessons: [
            { id: 'lesson-3', title: 'Triangles' },
          ],
        },
      ],
    },
    {
      id: 'course-2',
      title: 'Physics',
      modules: [],
    },
  ],
}

function mockFetch(data: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(data),
    }),
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const baseProps = {
  open: true,
  taskId: 'task-123',
  currentLessonIds: [],
  onClose: vi.fn(),
  onAssigned: vi.fn(),
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('AssignToLessonDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch(mockHierarchy)
  })

  it('does not render when closed', () => {
    render(<AssignToLessonDialog {...baseProps} open={false} />)
    expect(screen.queryByRole('heading', { name: /assign to lessons/i })).not.toBeInTheDocument()
  })

  it('shows loading state initially', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => mockHierarchy }), 200)),
      ),
    )
    render(<AssignToLessonDialog {...baseProps} />)
    expect(screen.getByText(/Loading courses/i)).toBeInTheDocument()
  })

  it('renders course tree after loading', async () => {
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('course-tree')).toBeInTheDocument()
    })
    expect(screen.getByText('Mathematics')).toBeInTheDocument()
    expect(screen.getByText('Physics')).toBeInTheDocument()
  })

  it('expands courses to show modules', async () => {
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => screen.getByText('Mathematics'))

    // All courses expanded by default → collapse first
    const courseBtn = screen.getByTestId('course-course-1')
    await userEvent.click(courseBtn)
    expect(screen.queryByTestId('module-module-1')).not.toBeInTheDocument()

    // Expand again
    await userEvent.click(courseBtn)
    expect(screen.getByTestId('module-module-1')).toBeInTheDocument()
  })

  it('expands modules to show lessons', async () => {
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => screen.getByText('Mathematics'))

    await userEvent.click(screen.getByTestId('module-module-1'))
    expect(screen.getByTestId('lesson-lesson-1')).toBeInTheDocument()
    expect(screen.getByTestId('lesson-lesson-2')).toBeInTheDocument()
  })

  it('save button is always enabled (can save with zero lessons)', async () => {
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => screen.getByText('Mathematics'))

    const saveBtn = screen.getByRole('button', { name: /save assignments/i })
    expect(saveBtn).not.toBeDisabled()
  })

  it('footer shows "No lessons selected" when nothing is checked', async () => {
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => screen.getByText('Mathematics'))
    expect(screen.getByText(/No lessons selected/i)).toBeInTheDocument()
  })

  it('checking a lesson updates the counter in the footer', async () => {
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => screen.getByText('Mathematics'))

    await userEvent.click(screen.getByTestId('module-module-1'))
    const checkbox = screen.getByTestId('lesson-lesson-1').querySelector('input[type="checkbox"]')!
    await userEvent.click(checkbox)

    expect(screen.getByText(/1 lesson selected/i)).toBeInTheDocument()
  })

  it('can select multiple lessons independently', async () => {
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => screen.getByText('Mathematics'))

    await userEvent.click(screen.getByTestId('module-module-1'))
    const cb1 = screen.getByTestId('lesson-lesson-1').querySelector('input[type="checkbox"]')!
    const cb2 = screen.getByTestId('lesson-lesson-2').querySelector('input[type="checkbox"]')!
    await userEvent.click(cb1)
    await userEvent.click(cb2)

    expect(screen.getByText(/2 lessons selected/i)).toBeInTheDocument()
  })

  it('pre-checks lessons from currentLessonIds', async () => {
    render(<AssignToLessonDialog {...baseProps} currentLessonIds={['lesson-1']} />)
    await waitFor(() => screen.getByText('Mathematics'))

    // module-1 should be auto-expanded because lesson-1 belongs there
    const cb = screen.getByTestId('lesson-lesson-1').querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(cb.checked).toBe(true)
    expect(screen.getByText(/1 lesson selected/i)).toBeInTheDocument()
  })

  it('calls assignTask with an array and fires onAssigned', async () => {
    const { assignTask } = await import('@/app/(admin)/admin/actions')
    const onAssigned = vi.fn()
    render(<AssignToLessonDialog {...baseProps} onAssigned={onAssigned} />)
    await waitFor(() => screen.getByText('Mathematics'))

    await userEvent.click(screen.getByTestId('module-module-1'))
    await userEvent.click(
      screen.getByTestId('lesson-lesson-1').querySelector('input[type="checkbox"]')!,
    )
    await userEvent.click(screen.getByRole('button', { name: /save assignments/i }))

    await waitFor(() => {
      expect(assignTask).toHaveBeenCalledWith('task-123', ['lesson-1'])
      expect(onAssigned).toHaveBeenCalled()
    })
  })

  it('calls assignTask with empty array when saving with no lessons selected', async () => {
    const { assignTask } = await import('@/app/(admin)/admin/actions')
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => screen.getByText('Mathematics'))

    await userEvent.click(screen.getByRole('button', { name: /save assignments/i }))

    await waitFor(() => {
      expect(assignTask).toHaveBeenCalledWith('task-123', [])
    })
  })

  it('calls onClose when cancel button clicked', async () => {
    const onClose = vi.fn()
    render(<AssignToLessonDialog {...baseProps} onClose={onClose} />)
    await waitFor(() => screen.getByText('Mathematics'))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows error when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: () => ({ error: 'Server error' }) }),
    )
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByText(/Could not load courses/i)).toBeInTheDocument()
    })
  })

  it('shows "No modules" for courses with empty modules', async () => {
    render(<AssignToLessonDialog {...baseProps} />)
    await waitFor(() => screen.getByText('Physics'))

    // All courses are expanded by default; Physics has no modules — text visible immediately
    expect(screen.getByText('No modules')).toBeInTheDocument()
  })
})
