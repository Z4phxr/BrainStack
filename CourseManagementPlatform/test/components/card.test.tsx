import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with content', () => {
      render(<Card>Card content</Card>)
      
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should have card data-slot attribute', () => {
      render(<Card data-testid="test-card">Content</Card>)
      
      const card = screen.getByTestId('test-card')
      expect(card).toHaveAttribute('data-slot', 'card')
    })

    it('should accept custom className', () => {
      render(<Card className="custom-card">Content</Card>)
      
      const card = screen.getByText('Content').closest('div')
      expect(card).toHaveClass('custom-card')
    })

    it('should render as div element', () => {
      render(<Card data-testid="card">Content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card.tagName).toBe('DIV')
    })
  })

  describe('CardHeader', () => {
    it('should render header with content', () => {
      render(<CardHeader>Header content</CardHeader>)
      
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('should have card-header data-slot attribute', () => {
      render(<CardHeader data-testid="test-header">Content</CardHeader>)
      
      const header = screen.getByTestId('test-header')
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })

    it('should accept custom className', () => {
      render(<CardHeader className="custom-header">Content</CardHeader>)
      
      const header = screen.getByText('Content').closest('div')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render title with text', () => {
      render(<CardTitle>Card Title</CardTitle>)
      
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('should have card-title data-slot attribute', () => {
      render(<CardTitle data-testid="test-title">Title</CardTitle>)
      
      const title = screen.getByTestId('test-title')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })

    it('should render as div element', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      
      const title = screen.getByTestId('title')
      expect(title.tagName).toBe('DIV')
    })

    it('should accept custom className', () => {
      render(<CardTitle className="text-lg">Title</CardTitle>)
      
      const title = screen.getByText('Title')
      expect(title).toHaveClass('text-lg')
    })
  })

  describe('CardDescription', () => {
    it('should render description with text', () => {
      render(<CardDescription>Card description</CardDescription>)
      
      expect(screen.getByText('Card description')).toBeInTheDocument()
    })

    it('should have card-description data-slot attribute', () => {
      render(<CardDescription data-testid="test-desc">Description</CardDescription>)
      
      const desc = screen.getByTestId('test-desc')
      expect(desc).toHaveAttribute('data-slot', 'card-description')
    })

    it('should accept custom className', () => {
      render(<CardDescription className="text-xs">Description</CardDescription>)
      
      const desc = screen.getByText('Description')
      expect(desc).toHaveClass('text-xs')
    })
  })

  describe('CardContent', () => {
    it('should render content area', () => {
      render(<CardContent>Main content</CardContent>)
      
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })

    it('should have card-content data-slot attribute', () => {
      render(<CardContent data-testid="test-content">Content</CardContent>)
      
      const content = screen.getByTestId('test-content')
      expect(content).toHaveAttribute('data-slot', 'card-content')
    })
  })

  describe('Card Composition', () => {
    it('should render full card with all parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('This is a test card')).toBeInTheDocument()
      expect(screen.getByText('Main content area')).toBeInTheDocument()
    })

    it('should maintain proper structure', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      const card = container.querySelector('[data-slot="card"]')
      const header = container.querySelector('[data-slot="card-header"]')
      const title = container.querySelector('[data-slot="card-title"]')
      const content = container.querySelector('[data-slot="card-content"]')

      expect(card).toBeInTheDocument()
      expect(header).toBeInTheDocument()
      expect(title).toBeInTheDocument()
      expect(content).toBeInTheDocument()
    })

    it('should support nested components', () => {
      render(
        <Card>
          <CardContent>
            <Card>
              <CardTitle>Nested</CardTitle>
            </Card>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Nested')).toBeInTheDocument()
    })
  })
})
