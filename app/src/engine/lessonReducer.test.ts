import { describe, it, expect } from 'vitest'
import { lessonReducer, initialState } from './lessonReducer'
import type { LessonState } from './types'
import { GREETING, EXPLORATION_PROMPT, GUIDED_STEPS, ASSESSMENT_INTRO, ASSESSMENT_STEPS, CELEBRATION } from './lessonScript'

describe('lessonReducer', () => {
  describe('initial state', () => {
    it('starts in intro phase with greeting', () => {
      expect(initialState.phase).toBe('intro')
      expect(initialState.messages).toHaveLength(1)
      expect(initialState.messages[0]).toEqual({ role: 'tutor', text: GREETING })
      expect(initialState.currentStepIndex).toBe(0)
      expect(initialState.attempts).toBe(0)
      expect(initialState.steps).toEqual(GUIDED_STEPS)
    })
  })

  describe('BEGIN_EXPLORATION', () => {
    it('transitions from intro to exploration with prompt', () => {
      const state = lessonReducer(initialState, { type: 'BEGIN_EXPLORATION' })
      expect(state.phase).toBe('exploration')
      expect(state.messages).toHaveLength(2)
      expect(state.messages[1]).toEqual({ role: 'tutor', text: EXPLORATION_PROMPT })
    })

    it('does nothing if not in intro phase', () => {
      const explorationState = lessonReducer(initialState, { type: 'BEGIN_EXPLORATION' })
      const state = lessonReducer(explorationState, { type: 'BEGIN_EXPLORATION' })
      expect(state).toBe(explorationState)
    })
  })

  describe('FINISH_EXPLORATION', () => {
    it('transitions from exploration to guided_discovery with first step prompt', () => {
      let state = lessonReducer(initialState, { type: 'BEGIN_EXPLORATION' })
      state = lessonReducer(state, { type: 'FINISH_EXPLORATION' })
      expect(state.phase).toBe('guided_discovery')
      expect(state.messages[state.messages.length - 1]).toEqual({
        role: 'tutor',
        text: GUIDED_STEPS[0].prompt,
      })
    })

    it('does nothing if not in exploration phase', () => {
      const state = lessonReducer(initialState, { type: 'FINISH_EXPLORATION' })
      expect(state).toBe(initialState)
    })
  })

  describe('CHECK_ANSWER (correct)', () => {
    function stateAtGuidedDiscovery(): LessonState {
      let s = lessonReducer(initialState, { type: 'BEGIN_EXPLORATION' })
      s = lessonReducer(s, { type: 'FINISH_EXPLORATION' })
      return s
    }

    it('advances to next step on correct answer (not last step)', () => {
      const before = stateAtGuidedDiscovery()
      const state = lessonReducer(before, {
        type: 'CHECK_ANSWER',
        numerator: 2,
        denominator: 4,
      })
      expect(state.phase).toBe('guided_discovery')
      expect(state.currentStepIndex).toBe(1)
      expect(state.attempts).toBe(0)
      expect(state.messages[state.messages.length - 2]).toEqual({
        role: 'tutor',
        text: GUIDED_STEPS[0].successMessage,
      })
      expect(state.messages[state.messages.length - 1]).toEqual({
        role: 'tutor',
        text: GUIDED_STEPS[1].prompt,
      })
    })

    it('advances through all guided steps to assessment phase', () => {
      let state = stateAtGuidedDiscovery()
      // Step 1: 2/4
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 })
      expect(state.currentStepIndex).toBe(1)
      // Step 2: 4/4
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 4, denominator: 4 })
      expect(state.currentStepIndex).toBe(2)
      // Step 3: 5/5
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 5, denominator: 5 })
      expect(state.phase).toBe('assessment')
      expect(state.steps).toEqual(ASSESSMENT_STEPS)
      expect(state.currentStepIndex).toBe(0)
      // Should have success message, assessment intro, and first assessment prompt
      const msgs = state.messages
      expect(msgs[msgs.length - 3]).toEqual({
        role: 'tutor',
        text: GUIDED_STEPS[2].successMessage,
      })
      expect(msgs[msgs.length - 2]).toEqual({
        role: 'tutor',
        text: ASSESSMENT_INTRO,
      })
      expect(msgs[msgs.length - 1]).toEqual({
        role: 'tutor',
        text: ASSESSMENT_STEPS[0].prompt,
      })
    })

    it('checks answer equivalence (4/8 also equals 2/4 target)', () => {
      const before = stateAtGuidedDiscovery()
      // 4/8 = 0.5 and 2/4 = 0.5, should be correct
      const state = lessonReducer(before, {
        type: 'CHECK_ANSWER',
        numerator: 4,
        denominator: 8,
      })
      expect(state.currentStepIndex).toBe(1)
      expect(state.phase).toBe('guided_discovery')
    })
  })

  describe('CHECK_ANSWER (incorrect)', () => {
    function stateAtGuidedDiscovery(): LessonState {
      let s = lessonReducer(initialState, { type: 'BEGIN_EXPLORATION' })
      s = lessonReducer(s, { type: 'FINISH_EXPLORATION' })
      return s
    }

    it('gives first hint on first wrong attempt', () => {
      const before = stateAtGuidedDiscovery()
      const state = lessonReducer(before, {
        type: 'CHECK_ANSWER',
        numerator: 1,
        denominator: 4,
      })
      expect(state.phase).toBe('guided_discovery')
      expect(state.attempts).toBe(1)
      expect(state.messages[state.messages.length - 1]).toEqual({
        role: 'tutor',
        text: GUIDED_STEPS[0].hints[0],
      })
    })

    it('gives second hint on second wrong attempt', () => {
      const before = stateAtGuidedDiscovery()
      let state = lessonReducer(before, {
        type: 'CHECK_ANSWER',
        numerator: 1,
        denominator: 4,
      })
      state = lessonReducer(state, {
        type: 'CHECK_ANSWER',
        numerator: 3,
        denominator: 4,
      })
      expect(state.attempts).toBe(2)
      expect(state.messages[state.messages.length - 1]).toEqual({
        role: 'tutor',
        text: GUIDED_STEPS[0].hints[1],
      })
    })

    it('repeats last hint on subsequent wrong attempts', () => {
      const before = stateAtGuidedDiscovery()
      let state = before
      // 3 wrong attempts
      for (let i = 0; i < 3; i++) {
        state = lessonReducer(state, {
          type: 'CHECK_ANSWER',
          numerator: 1,
          denominator: 4,
        })
      }
      expect(state.attempts).toBe(3)
      expect(state.messages[state.messages.length - 1]).toEqual({
        role: 'tutor',
        text: GUIDED_STEPS[0].hints[1], // last hint repeated
      })
    })

    it('does nothing if not in guided_discovery or assessment', () => {
      const state = lessonReducer(initialState, {
        type: 'CHECK_ANSWER',
        numerator: 2,
        denominator: 4,
      })
      expect(state).toBe(initialState)
    })
  })

  describe('assessment phase', () => {
    function stateAtAssessment(): LessonState {
      let s = lessonReducer(initialState, { type: 'START_LESSON' })
      s = lessonReducer(s, { type: 'BEGIN_EXPLORATION' })
      s = lessonReducer(s, { type: 'FINISH_EXPLORATION' })
      // Complete all guided steps
      s = lessonReducer(s, { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 })
      s = lessonReducer(s, { type: 'CHECK_ANSWER', numerator: 4, denominator: 4 })
      s = lessonReducer(s, { type: 'CHECK_ANSWER', numerator: 5, denominator: 5 })
      return s
    }

    it('starts with assessment steps loaded', () => {
      const state = stateAtAssessment()
      expect(state.phase).toBe('assessment')
      expect(state.steps).toEqual(ASSESSMENT_STEPS)
      expect(state.currentStepIndex).toBe(0)
      expect(state.attempts).toBe(0)
    })

    it('advances through assessment steps', () => {
      let state = stateAtAssessment()
      // Assessment step 1: make 1/2 (target 1/2)
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 })
      expect(state.phase).toBe('assessment')
      expect(state.currentStepIndex).toBe(1)
    })

    it('completes lesson after all assessment steps', () => {
      let state = stateAtAssessment()
      // Step 1: 1/2 (e.g. 2/4)
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 })
      // Step 2: 1 whole (e.g. 3/3)
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 3, denominator: 3 })
      // Step 3: dual zone (both 1/2)
      state = lessonReducer(state, {
        type: 'CHECK_ANSWER',
        numerator: 1, denominator: 2,
        numerator2: 2, denominator2: 4,
      })
      expect(state.phase).toBe('complete')
      expect(state.messages[state.messages.length - 1]).toEqual({
        role: 'tutor',
        text: CELEBRATION,
      })
    })

    it('shows walkthrough on 3rd wrong attempt', () => {
      let state = stateAtAssessment()
      // 3 wrong attempts
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 1, denominator: 4 })
      expect(state.messages[state.messages.length - 1].text).toBe(ASSESSMENT_STEPS[0].hints[0])
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 3, denominator: 4 })
      expect(state.messages[state.messages.length - 1].text).toBe(ASSESSMENT_STEPS[0].hints[1])
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 1, denominator: 4 })
      expect(state.messages[state.messages.length - 1].text).toBe(ASSESSMENT_STEPS[0].walkthrough)
    })

    it('continues showing walkthrough on subsequent wrong attempts', () => {
      let state = stateAtAssessment()
      // 4 wrong attempts
      for (let i = 0; i < 4; i++) {
        state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 1, denominator: 4 })
      }
      expect(state.attempts).toBe(4)
      expect(state.messages[state.messages.length - 1].text).toBe(ASSESSMENT_STEPS[0].walkthrough)
    })

    it('dual zone requires both zones correct', () => {
      let state = stateAtAssessment()
      // Advance to step 3 (dual zone)
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 2, denominator: 4 })
      state = lessonReducer(state, { type: 'CHECK_ANSWER', numerator: 3, denominator: 3 })
      expect(state.currentStepIndex).toBe(2)
      // Only zone 1 correct
      state = lessonReducer(state, {
        type: 'CHECK_ANSWER',
        numerator: 1, denominator: 2,
        numerator2: 1, denominator2: 4,
      })
      expect(state.phase).toBe('assessment') // not complete — zone 2 wrong
      expect(state.attempts).toBe(1)
    })
  })

  describe('RESET', () => {
    it('returns to initial state', () => {
      let state = lessonReducer(initialState, { type: 'BEGIN_EXPLORATION' })
      state = lessonReducer(state, { type: 'RESET' })
      expect(state).toEqual(initialState)
    })
  })
})
