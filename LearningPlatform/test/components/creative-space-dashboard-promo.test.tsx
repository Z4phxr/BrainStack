import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CreativeSpaceDashboardPromo } from '@/components/dashboard/creative-space-dashboard-promo'

describe('CreativeSpaceDashboardPromo', () => {
  it('renders headline and CTA linking to creative space list', () => {
    render(<CreativeSpaceDashboardPromo />)

    expect(screen.getByText('Creative Space')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /plan and learn on your own boards/i })).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /open creative space/i })
    expect(link).toHaveAttribute('href', '/creative-space')
  })
})
