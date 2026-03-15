import { describe, it, expect } from 'vitest'
import { lessonReducer, initialState } from './lessonReducer'
import type { LessonState } from './types'
import { GREETING, EXPLORATION_PROMPT, GUIDED_STEPS, CELEBRATION } from './lessonScript'

describe('lessonReducer', () => {
  describe('initial state', () => {
    it('starts in idle phase with no messages', () => {
      expect(initialState.phase).toBe('idle')
      expect(initialState.messages).toEqual([])
      expect(initialState.currentStepIndex).toBe(0)
      expect(initialState.attempts).toBe(0)
    })
  })

  describe('START_LESSON', () => {
    it('transitions to intro phase and appends greeting', () => {
      const state = lessonReducer(initialState, { type: 'START_LESSON' })
      expect(state.phase).toBe('intro')
      expect(state.messages).toHaveLength(1)
      expect(state.messages[0]).toEqual({ role: 'tutor', text: GREETING })
    })

    it('loads guided steps', () => {
      const state = lessonReducer(initialState, { type: 'START_LESSON' })
      expect(state.steps).toEqual(GUIDED_STEPS)
    })
  })

  describe('BEGIN_EXPLORATION', () => {
    it('transitions from intro to exploration with prompt', () => {
      const introState = lessonReducer(initialState, { type: 'START_LESSON' })
      const state = lessonReducer(introState, { type: 'BEGIN_EXPLORATION' })
      expect(state.phase).toBe('exploration')
      expect(state.messages).toHaveLength(2)
      expect(state.messages[1]).toEqual({ role: 'tutor', text: EXPLORATION_PROMPT })
    })

    it('does nothing if not in intro phase', () => {
      const state = lessonReducer(initialState, { type: 'BEGIN_EXPLORATION' })
      expect(state).toBe(initialState)
    })
  })

  describe('FINISH_EXPLORATION', () => {
    it('transitions from exploration to guided_discovery with first step prompt', () => {
      let state = lessonReducer(initialState, { type: 'START_LESSON' })
      state = lessonReducer(state, { type: 'BEGIN_EXPLORATION' })
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
      let s = lessonReducer(initialState, { type: 'START_LESSON' })
      s = lessonReducer(s, { type: 'BEGIN_EXPLORATION' })
      s = lessonReducer(s, { type: 'FINISH_EXPLORATION' })
      return s
    }

    it('appends success message and advances to complete when last step', () => {
      const before = stateAtGuidedDiscovery()
      const state = lessonReducer(before, {
        type: 'CHECK_ANSWER',
        numerator: 2,
        denominator: 4,
      })
      expect(state.messages[state.messages.length - 2]).toEqual({
        role: 'tutor',
        text: GUIDED_STEPS[0].successMessage,
      })
      expect(state.messages[state.messages.length - 1]).toEqual({
        role: 'tutor',
        text: CELEBRATION,
      })
      expect(state.phase).toBe('complete')
      expect(state.attempts).toBe(0)
    })

    it('checks answer equivalence (4/8 also equals 2/4 target)', () => {
      const before = stateAtGuidedDiscovery()
      // 4/8 = 0.5 and 2/4 = 0.5, should be correct
      const state = lessonReducer(before, {
        type: 'CHECK_ANSWER',
        numerator: 4,
        denominator: 8,
      })
      expect(state.phase).toBe('complete')
    })
  })

  describe('CHECK_ANSWER (incorrect)', () => {
    function stateAtGuidedDiscovery(): LessonState {
      let s = lessonReducer(initialState, { type: 'START_LESSON' })
      s = lessonReducer(s, { type: 'BEGIN_EXPLORATION' })
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

    it('does nothing if not in guided_discovery', () => {
      const state = lessonReducer(initialState, {
        type: 'CHECK_ANSWER',
        numerator: 2,
        denominator: 4,
      })
      expect(state).toBe(initialState)
    })
  })

  describe('RESET', () => {
    it('returns to initial state', () => {
      let state = lessonReducer(initialState, { type: 'START_LESSON' })
      state = lessonReducer(state, { type: 'BEGIN_EXPLORATION' })
      state = lessonReducer(state, { type: 'RESET' })
      expect(state).toEqual(initialState)
    })
  })
})
