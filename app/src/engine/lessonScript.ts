import type { GuidedStep } from './types'

export const GREETING = "Hi there! Welcome to Fraction Explorer. Today we're going to discover how fractions can be equal to each other."

export const EXPLORATION_PROMPT = "Try dragging the blocks around! See what happens when you put them in the comparison zone. When you're ready, press 'Let's Go!' to start the guided activity."

export const CELEBRATION = "Amazing work! You've shown that different fractions can be equal — and that many different fractions can all add up to one whole. Keep exploring fractions — there's so much more to discover!"

export const GUIDED_STEPS: GuidedStep[] = [
  {
    id: 'make-half-with-quarters',
    prompt: 'Can you make 1/2 using only quarter blocks? Drag them into the zone!',
    targetNumerator: 2,
    targetDenominator: 4,
    hints: [
      'Not quite, try dragging two 1/4 blocks into the zone.',
      'You need exactly two 1/4 blocks. Each quarter is 1/4, and 1/4 + 1/4 = 2/4 = 1/2.',
    ],
    successMessage: "That's right! Two quarters make one half: 1/4 + 1/4 = 2/4 = 1/2. Great job!",
  },
  {
    id: 'whole-with-quarters',
    prompt: 'Now try this: can you show that 2/2 and 4/4 are the same? Fill the zone with quarter blocks to make a whole!',
    targetNumerator: 4,
    targetDenominator: 4,
    hints: [
      'A whole means filling everything up. How many quarter blocks do you need to make a complete whole?',
      'You need four 1/4 blocks! 1/4 + 1/4 + 1/4 + 1/4 = 4/4 — and that equals one whole, just like 2/2.',
    ],
    successMessage: "Brilliant! 4/4 = 2/2 = 1 whole. No matter how you slice it, a whole is a whole!",
  },
  {
    id: 'whole-with-fifths',
    prompt: 'Can you make 1 whole using only fifth blocks? How many do you need?',
    targetNumerator: 5,
    targetDenominator: 5,
    hints: [
      'Each fifth block is 1/5 of the whole. How many fifths does it take to fill it all the way up?',
      'You need five 1/5 blocks! 1/5 + 1/5 + 1/5 + 1/5 + 1/5 = 5/5 = 1 whole.',
    ],
    successMessage: "You got it! Five fifths make a whole: 5/5 = 1. You're really getting the hang of this!",
  },
]
