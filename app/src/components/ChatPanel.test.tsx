import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('ChatPanel (smoke tests)', () => {
  it('renders tutor messages on load', () => {
    render(<App />)
    // The greeting message should appear
    expect(screen.getByText(/Welcome to Fraction Explorer/i)).toBeInTheDocument()
    // Tutor label should be present
    expect(screen.getByText('Tutor')).toBeInTheDocument()
  })

  it('renders the "Start Exploring" action button in intro phase', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Start Exploring/i })).toBeInTheDocument()
  })

  it('shows "Let\'s Go!" button after clicking Start Exploring', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Start Exploring/i }))
    expect(screen.getByRole('button', { name: /Let's Go/i })).toBeInTheDocument()
  })

  it('shows guided discovery prompt after clicking Let\'s Go', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Start Exploring/i }))
    await user.click(screen.getByRole('button', { name: /Let's Go/i }))
    // First guided step prompt should appear
    expect(screen.getByText(/quarter blocks/i)).toBeInTheDocument()
  })

  it('renders multiple messages as conversation progresses', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Start Exploring/i }))
    // Should have greeting + exploration prompt
    const tutorLabels = screen.getAllByText('Tutor')
    expect(tutorLabels.length).toBeGreaterThanOrEqual(2)
  })
})
