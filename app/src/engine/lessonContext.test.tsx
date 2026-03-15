import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LessonProvider, useLesson } from './lessonContext'
import { GREETING, EXPLORATION_PROMPT } from './lessonScript'

function TestConsumer() {
  const { state, dispatch } = useLesson()
  return (
    <div>
      <span data-testid="phase">{state.phase}</span>
      <span data-testid="msg-count">{state.messages.length}</span>
      <span data-testid="last-msg">{state.messages[state.messages.length - 1]?.text}</span>
      <button data-testid="begin" onClick={() => dispatch({ type: 'BEGIN_EXPLORATION' })}>
        Begin
      </button>
      <button data-testid="reset" onClick={() => dispatch({ type: 'RESET' })}>
        Reset
      </button>
    </div>
  )
}

describe('LessonContext', () => {
  it('provides initial state to children', () => {
    render(
      <LessonProvider>
        <TestConsumer />
      </LessonProvider>,
    )
    expect(screen.getByTestId('phase').textContent).toBe('intro')
    expect(screen.getByTestId('msg-count').textContent).toBe('1')
    expect(screen.getByTestId('last-msg').textContent).toBe(GREETING)
  })

  it('dispatch updates state and re-renders consumers', () => {
    render(
      <LessonProvider>
        <TestConsumer />
      </LessonProvider>,
    )
    act(() => {
      screen.getByTestId('begin').click()
    })
    expect(screen.getByTestId('phase').textContent).toBe('exploration')
    expect(screen.getByTestId('msg-count').textContent).toBe('2')
    expect(screen.getByTestId('last-msg').textContent).toBe(EXPLORATION_PROMPT)
  })

  it('RESET returns to initial state after dispatches', () => {
    render(
      <LessonProvider>
        <TestConsumer />
      </LessonProvider>,
    )
    act(() => screen.getByTestId('begin').click())
    expect(screen.getByTestId('phase').textContent).toBe('exploration')

    act(() => screen.getByTestId('reset').click())
    expect(screen.getByTestId('phase').textContent).toBe('intro')
    expect(screen.getByTestId('msg-count').textContent).toBe('1')
  })

  it('throws when useLesson is used outside LessonProvider', () => {
    // Suppress React error boundary console noise
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow(
      'useLesson must be used within a LessonProvider',
    )
    spy.mockRestore()
  })
})
