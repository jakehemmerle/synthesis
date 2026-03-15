import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from '@/App'

describe('WorkspacePanel (smoke tests)', () => {
  it('renders the SVG workspace', () => {
    const { container } = render(<App />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders fraction blocks in the tray', () => {
    const { container } = render(<App />)
    // Blocks are rendered as <g> groups with <rect> and <text> children
    const blockTexts = container.querySelectorAll('svg text')
    // Should have block labels like "1/2", "1/4", "1/3", "1/5" plus zone labels
    const labels = Array.from(blockTexts).map(t => t.textContent)
    expect(labels).toEqual(expect.arrayContaining(['1/2', '1/4', '1/3', '1/5']))
  })

  it('renders the comparison zone', () => {
    const { container } = render(<App />)
    const svgTexts = container.querySelectorAll('svg text')
    const labels = Array.from(svgTexts).map(t => t.textContent)
    expect(labels).toContain('Drop blocks here')
  })

  it('renders the "Block Tray" label', () => {
    const { container } = render(<App />)
    const svgTexts = container.querySelectorAll('svg text')
    const labels = Array.from(svgTexts).map(t => t.textContent)
    expect(labels).toContain('Block Tray')
  })

  it('renders draggable block rects', () => {
    const { container } = render(<App />)
    // Each block has a rect with cursor="grab"
    const grabbables = container.querySelectorAll('rect[cursor="grab"]')
    // We expect 14 blocks: 2 halves + 4 quarters + 3 thirds + 5 fifths
    expect(grabbables.length).toBe(14)
  })
})
