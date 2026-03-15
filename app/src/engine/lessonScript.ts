import type { GuidedStep } from './types'

export const GREETING = "Hi there! Welcome to Fraction Explorer. Today we're going to discover how fractions can be equal to each other."

export const EXPLORATION_PROMPT = "Try dragging the blocks around! See what happens when you put them in the comparison zone. When you're ready, press 'Let's Go!' to start the guided activity."

export const CELEBRATION = "Amazing work! You've shown that different fractions can be equal — and that many different fractions can all add up to one whole. Keep exploring fractions — there's so much more to discover!"

export const ASSESSMENT_INTRO = "Great job on the guided problems! Now let's see what you've learned. Try these challenge problems on your own!"

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
    prompt: 'Now try this: can you make a whole using only quarter blocks?',
    targetNumerator: 4,
    targetDenominator: 4,
    hints: [
      'You need four quarter blocks. Drag them from the tray one at a time!',
      'You need four 1/4 blocks! 1/4 + 1/4 + 1/4 + 1/4 = 4/4 = 1 whole.',
    ],
    successMessage: "Brilliant! 4/4 = 1 whole. No matter how you slice it, a whole is a whole!",
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

export const ASSESSMENT_STEPS: GuidedStep[] = [
  {
    id: 'assess-half-with-quarters',
    prompt: 'Challenge 1 of 3: Make 1/2 using only the quarter blocks below.',
    targetNumerator: 1,
    targetDenominator: 2,
    hints: [
      'Think about how many quarters fit into one half.',
      'Remember from earlier — two quarters make a half. Try dragging 1/4 blocks into the zone.',
    ],
    walkthrough: "Here's how: drag two 1/4 blocks into the zone. 1/4 + 1/4 = 2/4, and 2/4 is the same as 1/2. Try it now!",
    successMessage: "Nice! You remembered that 2/4 = 1/2. On to the next one!",
    trayBlocks: [
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 4 },
    ],
  },
  {
    id: 'assess-whole-with-thirds',
    prompt: 'Challenge 2 of 3: Make 1 whole using only third blocks.',
    targetNumerator: 1,
    targetDenominator: 1,
    hints: [
      'How many third blocks do you need to fill up a whole?',
      'A whole is 3/3. Try dragging three 1/3 blocks into the zone.',
    ],
    walkthrough: "Here's how: drag three 1/3 blocks into the zone. 1/3 + 1/3 + 1/3 = 3/3 = 1 whole. Give it a try!",
    successMessage: "Excellent! 3/3 = 1 whole. You've got this!",
    trayBlocks: [
      { numerator: 1, denominator: 3 },
      { numerator: 1, denominator: 3 },
      { numerator: 1, denominator: 3 },
      { numerator: 1, denominator: 3 },
    ],
  },
  {
    id: 'assess-two-ways-half',
    prompt: 'Challenge 3 of 3: Show two different ways to make 1/2! Fill both zones so each one equals 1/2, but use different blocks in each.',
    targetNumerator: 1,
    targetDenominator: 2,
    dualZone: true,
    hints: [
      'Each zone needs to equal 1/2. Can you use different types of blocks in each zone?',
      'Try putting a 1/2 block in one zone, and two 1/4 blocks in the other zone.',
    ],
    walkthrough: "Here's how: put the 1/2 block in one zone, and put two 1/4 blocks in the other zone. Both equal 1/2, but they use different blocks! Try it now.",
    successMessage: "Fantastic! You showed that 1/2 and 2/4 are the same amount — they're equivalent fractions! You've completed all the challenges!",
    trayBlocks: [
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 3 },
      { numerator: 1, denominator: 5 },
    ],
  },
]
