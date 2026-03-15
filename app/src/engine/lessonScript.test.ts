import { describe, it, expect } from 'vitest'
import { GUIDED_STEPS, ASSESSMENT_STEPS, GREETING, EXPLORATION_PROMPT, CELEBRATION, ASSESSMENT_INTRO } from './lessonScript'
import type { GuidedStep } from './types'

describe('lessonScript', () => {
  describe('string constants', () => {
    it('GREETING is a non-empty string', () => {
      expect(GREETING).toBeTruthy()
      expect(typeof GREETING).toBe('string')
    })

    it('EXPLORATION_PROMPT is a non-empty string', () => {
      expect(EXPLORATION_PROMPT).toBeTruthy()
    })

    it('ASSESSMENT_INTRO is a non-empty string', () => {
      expect(ASSESSMENT_INTRO).toBeTruthy()
    })

    it('CELEBRATION is a non-empty string', () => {
      expect(CELEBRATION).toBeTruthy()
    })
  })

  describe('GUIDED_STEPS structure', () => {
    it('has exactly 3 guided steps', () => {
      expect(GUIDED_STEPS).toHaveLength(3)
    })

    it('all step IDs are unique', () => {
      const ids = GUIDED_STEPS.map(s => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it.each(GUIDED_STEPS.map((s, i) => [s.id, s, i] as const))(
      'step "%s" has at least 2 hints',
      (_id, step) => {
        expect(step.hints.length).toBeGreaterThanOrEqual(2)
      },
    )

    it.each(GUIDED_STEPS.map(s => [s.id, s] as const))(
      'step "%s" has required fields',
      (_id, step) => {
        expect(step.prompt).toBeTruthy()
        expect(step.successMessage).toBeTruthy()
        expect(step.targetDenominator).toBeGreaterThan(0)
        expect(step.targetNumerator).toBeGreaterThan(0)
      },
    )
  })

  describe('ASSESSMENT_STEPS structure', () => {
    it('has exactly 3 assessment steps', () => {
      expect(ASSESSMENT_STEPS).toHaveLength(3)
    })

    it('all step IDs are unique', () => {
      const ids = ASSESSMENT_STEPS.map(s => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('no assessment step ID collides with a guided step ID', () => {
      const guidedIds = new Set(GUIDED_STEPS.map(s => s.id))
      for (const step of ASSESSMENT_STEPS) {
        expect(guidedIds.has(step.id)).toBe(false)
      }
    })

    it.each(ASSESSMENT_STEPS.map(s => [s.id, s] as const))(
      'step "%s" has at least 2 hints',
      (_id, step) => {
        expect(step.hints.length).toBeGreaterThanOrEqual(2)
      },
    )

    it.each(ASSESSMENT_STEPS.map(s => [s.id, s] as const))(
      'step "%s" has escalating hints (walkthrough present)',
      (_id, step) => {
        expect(step.walkthrough).toBeTruthy()
      },
    )

    it.each(ASSESSMENT_STEPS.map(s => [s.id, s] as const))(
      'step "%s" has trayBlocks defined',
      (_id, step) => {
        expect(step.trayBlocks).toBeDefined()
        expect(step.trayBlocks!.length).toBeGreaterThan(0)
      },
    )

    it.each(ASSESSMENT_STEPS.map(s => [s.id, s] as const))(
      'step "%s" has required fields',
      (_id, step) => {
        expect(step.prompt).toBeTruthy()
        expect(step.successMessage).toBeTruthy()
        expect(step.targetDenominator).toBeGreaterThan(0)
        expect(step.targetNumerator).toBeGreaterThan(0)
      },
    )
  })

  describe('phase transitions cover full flow', () => {
    it('guided steps lead into assessment steps (no dead ends)', () => {
      // The reducer transitions: intro → exploration → guided_discovery (3 steps) → assessment (3 steps) → complete
      // Verify both arrays have content so the reducer can iterate through them
      expect(GUIDED_STEPS.length).toBeGreaterThan(0)
      expect(ASSESSMENT_STEPS.length).toBeGreaterThan(0)
    })

    it('all step IDs across both phases are unique (no collisions)', () => {
      const allSteps: GuidedStep[] = [...GUIDED_STEPS, ...ASSESSMENT_STEPS]
      const ids = allSteps.map(s => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('hint escalation', () => {
    const allSteps: GuidedStep[] = [...GUIDED_STEPS, ...ASSESSMENT_STEPS]

    it.each(allSteps.map(s => [s.id, s] as const))(
      'step "%s" hints are distinct strings',
      (_id, step) => {
        const uniqueHints = new Set(step.hints)
        expect(uniqueHints.size).toBe(step.hints.length)
      },
    )

    it('assessment steps have walkthrough distinct from hints', () => {
      for (const step of ASSESSMENT_STEPS) {
        expect(step.hints).not.toContain(step.walkthrough)
      }
    })
  })
})
