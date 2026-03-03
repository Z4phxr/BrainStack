import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteTaskDialog } from '@/components/admin/delete-task-dialog'

// ─── Test data ─────────────────────────────────────────────────────────────────

const baseProps = {
  open: true,
  taskName: 'What is the capital of France?',
  usedInLessons: [],
  loading: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('DeleteTaskDialog', () => {
  it('does not render when closed', () => {
    render(<DeleteTaskDialog {...baseProps} open={false} />)
    expect(screen.queryByTestId('delete-task-dialog')).not.toBeInTheDocument()
  })

  it('renders confirmation message when open', () => {
    render(<DeleteTaskDialog {...baseProps} />)
    expect(screen.getByText(/Are you sure you want to delete this task/i)).toBeInTheDocument()
  })

  it('displays the task name in the preview', () => {
    render(<DeleteTaskDialog {...baseProps} />)
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
  })

  it('shows "cannot be undone" warning', () => {
    render(<DeleteTaskDialog {...baseProps} />)
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
  })

  it('does NOT show lesson usage section when no lessons', () => {
    render(<DeleteTaskDialog {...baseProps} usedInLessons={[]} />)
    expect(screen.queryByText(/This task is currently used in/i)).not.toBeInTheDocument()
  })

  it('shows lesson usage section when task is in lessons', () => {
    const lessons = [
      { id: 'lesson-1', title: 'Introduction to Algebra' },
      { id: 'lesson-2', title: 'Advanced Calculus' },
    ]
    render(<DeleteTaskDialog {...baseProps} usedInLessons={lessons} />)
    expect(screen.getByText(/This task is currently used in/i)).toBeInTheDocument()
    expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument()
    expect(screen.getByText('Advanced Calculus')).toBeInTheDocument()
  })

  it('renders a testid for each used-in lesson', () => {
    const lessons = [{ id: 'lesson-abc', title: 'Lesson ABC' }]
    render(<DeleteTaskDialog {...baseProps} usedInLessons={lessons} />)
    expect(screen.getByTestId('used-in-lesson-lesson-abc')).toBeInTheDocument()
  })

  it('calls onConfirm when "Delete task" button is clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<DeleteTaskDialog {...baseProps} onConfirm={onConfirm} />)
    await user.click(screen.getByTestId('confirm-delete-btn'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when "Cancel" button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<DeleteTaskDialog {...baseProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows loading spinner and disables button while loading', () => {
    render(<DeleteTaskDialog {...baseProps} loading={true} />)
    expect(screen.getByText(/Deleting/i)).toBeInTheDocument()
    expect(screen.getByTestId('confirm-delete-btn')).toBeDisabled()
  })

  it('disables cancel button while loading', () => {
    render(<DeleteTaskDialog {...baseProps} loading={true} />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })
})
