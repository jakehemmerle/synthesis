import { describe, it, expect } from 'vitest'
import { lessonReducer, initialState } from './lessonReducer'
import type { LessonState } from './types'
import {
  GREETING,
  EXPLORATION_PROMPT,
  GUIDED_STEPS,
  ASSESSMENT_INTRO,
  ASSESSMENT_STEPS,
  CELEBRATION,
} from './lessonScript'

/**
 * Integration test: simulates a full lesson dispatch sequence from
 * START through all guided problems, assessment, and completion.
 */

function dispatch(state: LessonState, ...actions: Parameters<typeof lessonReducer>[1][]): LessonState {
  return actions.reduce((s, a) => lessonReducer(s, a), state)
}

describe('Full lesson flow integration', () => {
  it('completes entire lesson: intro → explore → guided (3) → assessment (3) → complete', () => {
    let state = initialState

    // --- Phase: intro ---
    expect(state.phase).toBe('intro')
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].text).toBe(GREETING)

    // --- Transition: intro → exploration ---
    state = lessonReducer(state, { type: 'BEGIN_EXPLORATION' })
    expect(state.phase).toBe('exploration')
    expect(state.messages[state.messages.length - 1].text).toBe(EXPLORATION_PROMPT)

    // --- Transition: exploration → guided_discovery ---
    state = lessonReducer(state, { type: 'FINISH_EXPLORATION' })
    expect(state.phase).toBe('guided_discovery')
    expect(state.currentStepIndex).toBe(0)
    expect(state.steps).toEqual(GUIDED_STEPS)
    expect(state.messages[state.messages.length - 1].text).toBe(GUIDED_STEPS[0].prompt)

    // --- Guided problem 1: make 1/2 with quarters (target 2/4) ---
    // Wrong answer first → verify hint
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 1, denominator: 4 })
    expect(state.phase).toBe('guided_discovery')
    expect(state.currentStepIndex).toBe(0)
    expect(state.attempts).toBe(1)
    expect(state.messages[state.messages.length - 1].text).toBe(GUIDED_STEPS[0].hints[0])

    // Correct answer
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 })
    expect(state.currentStepIndex).toBe(1)
    expect(state.attempts).toBe(0)
    expect(state.messages[state.messages.length - 2].text).toBe(GUIDED_STEPS[0].successMessage)
    expect(state.messages[state.messages.length - 1].text).toBe(GUIDED_STEPS[1].prompt)

    // --- Guided problem 2: whole with quarters (target 4/4) ---
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 4, denominator: 4 })
    expect(state.currentStepIndex).toBe(2)
    expect(state.messages[state.messages.length - 1].text).toBe(GUIDED_STEPS[2].prompt)

    // --- Guided problem 3: whole with fifths (target 5/5) ---
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 5, denominator: 5 })

    // Should transition to assessment phase
    expect(state.phase).toBe('assessment')
    expect(state.steps).toEqual(ASSESSMENT_STEPS)
    expect(state.currentStepIndex).toBe(0)
    expect(state.attempts).toBe(0)
    expect(state.messages[state.messages.length - 2].text).toBe(ASSESSMENT_INTRO)
    expect(state.messages[state.messages.length - 1].text).toBe(ASSESSMENT_STEPS[0].prompt)

    // --- Assessment problem 1: make 1/2 (target 1/2) ---
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 })
    expect(state.phase).toBe('assessment')
    expect(state.currentStepIndex).toBe(1)
    expect(state.messages[state.messages.length - 1].text).toBe(ASSESSMENT_STEPS[1].prompt)

    // --- Assessment problem 2: make 1 whole (target 1/1) ---
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 3, denominator: 3 })
    expect(state.phase).toBe('assessment')
    expect(state.currentStepIndex).toBe(2)

    // --- Assessment problem 3: dual zone, both must equal 1/2 ---
    state = lessonReducer(state, {
      type: 'CHECK_ANSWER',
      numerator: 1,
      denominator: 2,
      numerator2: 2,
      denominator2: 4,
    })

    // Should reach complete
    expect(state.phase).toBe('complete')
    expect(state.messages[state.messages.length - 1].text).toBe(CELEBRATION)
  })

  it('hint escalation: escalates through all hints then shows walkthrough', () => {
    // Get to assessment phase
    let state = dispatch(
      initialState,
      { type: 'BEGIN_EXPLORATION' },
      { type: 'FINISH_EXPLORATION' },
      { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 },
      { type: 'CHECK_ANSWER', numerator: 4, denominator: 4 },
      { type: 'CHECK_ANSWER', numerator: 5, denominator: 5 },
    )
    expect(state.phase).toBe('assessment')

    const step = ASSESSMENT_STEPS[0]

    // Wrong attempt 1 → hint 0
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 1, denominator: 8 })
    expect(state.attempts).toBe(1)
    expect(state.messages[state.messages.length - 1].text).toBe(step.hints[0])

    // Wrong attempt 2 → hint 1
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 1, denominator: 8 })
    expect(state.attempts).toBe(2)
    expect(state.messages[state.messages.length - 1].text).toBe(step.hints[1])

    // Wrong attempt 3 → walkthrough (attempts >= 2 when checked)
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 1, denominator: 8 })
    expect(state.attempts).toBe(3)
    expect(state.messages[state.messages.length - 1].text).toBe(step.walkthrough)

    // Wrong attempt 4 → still walkthrough
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 1, denominator: 8 })
    expect(state.attempts).toBe(4)
    expect(state.messages[state.messages.length - 1].text).toBe(step.walkthrough)

    // Can still answer correctly after walkthrough
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 })
    expect(state.currentStepIndex).toBe(1)
    expect(state.attempts).toBe(0)
  })

  it('guided steps have no walkthrough; hints cycle at last hint', () => {
    let state = dispatch(
      initialState,
      { type: 'BEGIN_EXPLORATION' },
      { type: 'FINISH_EXPLORATION' },
    )

    const step = GUIDED_STEPS[0]
    expect(step.walkthrough).toBeUndefined()

    // 5 wrong attempts — should cycle last hint (no walkthrough)
    for (let i = 0; i < 5; i++) {
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 1, denominator: 8 })
      const expectedHint = step.hints[Math.min(i, step.hints.length - 1)]
      expect(state.messages[state.messages.length - 1].text).toBe(expectedHint)
    }
    expect(state.attempts).toBe(5)
    expect(state.currentStepIndex).toBe(0) // still stuck on step 0
  })

  it('equivalent fractions are accepted (4/8 == 1/2)', () => {
    let state = dispatch(
      initialState,
      { type: 'BEGIN_EXPLORATION' },
      { type: 'FINISH_EXPLORATION' },
    )
    // Target for step 1 is 2/4 = 0.5; 4/8 = 0.5 should also work
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 4, denominator: 8 })
    expect(state.currentStepIndex).toBe(1)
  })

  it('phase guards prevent out-of-order dispatches', () => {
    // BEGIN_EXPLORATION only works in intro
    const exploration = lessonReducer(initialState, { type: 'BEGIN_EXPLORATION' })
    expect(lessonReducer(exploration, { type: 'BEGIN_EXPLORATION' })).toBe(exploration)

    // FINISH_EXPLORATION only works in exploration
    expect(lessonReducer(initialState, { type: 'FINISH_EXPLORATION' })).toBe(initialState)

    // CHECK_ANSWER only works in guided_discovery or assessment
    expect(
      lessonReducer(initialState, { type: 'CHECK_ANSWER', numerator: 1, denominator: 2 }),
    ).toBe(initialState)
    expect(
      lessonReducer(exploration, { type: 'CHECK_ANSWER', numerator: 1, denominator: 2 }),
    ).toBe(exploration)
  })

  it('dual zone: fails when only one zone is correct', () => {
    // Get to assessment step 3 (dual zone)
    let state = dispatch(
      initialState,
      { type: 'BEGIN_EXPLORATION' },
      { type: 'FINISH_EXPLORATION' },
      { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 },
      { type: 'CHECK_ANSWER', numerator: 4, denominator: 4 },
      { type: 'CHECK_ANSWER', numerator: 5, denominator: 5 },
      // Assessment steps 1-2
      { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 },
      { type: 'CHECK_ANSWER', numerator: 3, denominator: 3 },
    )
    expect(state.currentStepIndex).toBe(2)
    expect(state.steps[2].dualZone).toBe(true)

    // Zone 1 correct, zone 2 wrong
    state = lessonReducer(state, {
      type: 'CHECK_ANSWER',
      numerator: 1, denominator: 2,
      numerator2: 1, denominator2: 3,
    })
    expect(state.phase).toBe('assessment')
    expect(state.attempts).toBe(1)

    // Zone 1 wrong, zone 2 correct
    state = lessonReducer(state, {
      type: 'CHECK_ANSWER',
      numerator: 1, denominator: 3,
      numerator2: 2, denominator2: 4,
    })
    expect(state.phase).toBe('assessment')
    expect(state.attempts).toBe(2)

    // Both correct → complete
    state = lessonReducer(state, {
      type: 'CHECK_ANSWER',
      numerator: 1, denominator: 2,
      numerator2: 2, denominator2: 4,
    })
    expect(state.phase).toBe('complete')
  })

  it('message count grows correctly through full flow', () => {
    let state = initialState
    const msgCounts: number[] = [state.messages.length] // [1] — greeting

    state = lessonReducer(state, { type: 'BEGIN_EXPLORATION' })
    msgCounts.push(state.messages.length) // [1, 2]

    state = lessonReducer(state, { type: 'FINISH_EXPLORATION' })
    msgCounts.push(state.messages.length) // [1, 2, 3]

    // Guided step 1 correct
    state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 })
    msgCounts.push(state.messages.length) // success + next prompt = +2

    // Each message count should be strictly increasing
    for (let i = 1; i < msgCounts.length; i++) {
      expect(msgCounts[i]).toBeGreaterThan(msgCounts[i - 1])
    }
  })
})
