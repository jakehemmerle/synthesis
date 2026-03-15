import type { GuidedStep } from './types'

export const GREETING = "Hi there! Welcome to Fraction Explorer. Today we're going to discover how fractions can be equal to each other."

export const EXPLORATION_PROMPT = "Try dragging the blocks around! See what happens when you put them in the comparison zone. When you're ready, press 'Let's Go!' to start the guided activity."

export const CELEBRATION = "Amazing work! You've shown that different fractions can be equal. Two quarters really do make one half! Keep exploring fractions — there's so much more to discover."

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
]
