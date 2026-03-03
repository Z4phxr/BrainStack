import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import userEvent from '@testing-library/user-event'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should render as a button element by default', () => {
    render(<Button>Submit</Button>)
    
    const button = screen.getByRole('button', { name: 'Submit' })
    expect(button.tagName).toBe('BUTTON')
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    let clicked = false
    const handleClick = () => { clicked = true }
    
    render(<Button onClick={handleClick}>Click</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(clicked).toBe(true)
  })

  it('should apply default variant styles', () => {
    render(<Button>Default</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'default')
  })

  it('should apply destructive variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'destructive')
  })

  it('should apply outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'outline')
  })

  it('should apply secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'secondary')
  })

  it('should apply ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'ghost')
  })

  it('should apply link variant styles', () => {
    render(<Button variant="link">Link</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'link')
  })

  it('should apply small size', () => {
    render(<Button size="sm">Small</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-size', 'sm')
  })

  it('should apply large size', () => {
    render(<Button size="lg">Large</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-size', 'lg')
  })

  it('should apply icon size', () => {
    render(<Button size="icon">⚙</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-size', 'icon')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should not trigger onClick when disabled', async () => {
    const user = userEvent.setup()
    let clicked = false
    const handleClick = () => { clicked = true }
    
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(clicked).toBe(false)
  })

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should accept type attribute', () => {
    render(<Button type="submit">Submit</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should support button type="button"', () => {
    render(<Button type="button">Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should render children correctly', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    )
    
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('should combine multiple variants and sizes', () => {
    render(
      <Button variant="outline" size="lg">
        Large Outline
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'outline')
    expect(button).toHaveAttribute('data-size', 'lg')
  })

  it('should handle aria-label for accessibility', () => {
    render(<Button aria-label="Close dialog">×</Button>)
    
    const button = screen.getByLabelText('Close dialog')
    expect(button).toBeInTheDocument()
  })

  it('should support data attributes', () => {
    render(<Button data-testid="custom-button">Test</Button>)
    
    const button = screen.getByTestId('custom-button')
    expect(button).toBeInTheDocument()
  })
})
