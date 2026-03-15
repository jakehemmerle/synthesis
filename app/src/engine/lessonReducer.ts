import type { LessonState, LessonAction, GuidedStep } from './types'
import { GREETING, EXPLORATION_PROMPT, GUIDED_STEPS, ASSESSMENT_INTRO, ASSESSMENT_STEPS, CELEBRATION } from './lessonScript'

export const initialState: LessonState = {
  phase: 'intro',
  messages: [{ role: 'tutor', text: GREETING }],
  currentStepIndex: 0,
  steps: GUIDED_STEPS,
  attempts: 0,
}

function isAnswerCorrect(
  answerN: number,
  answerD: number,
  targetN: number,
  targetD: number,
): boolean {
  if (answerD === 0 || targetD === 0) return false
  return answerN * targetD === targetN * answerD
}

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'START_LESSON':
      return {
        ...initialState,
      }

    case 'BEGIN_EXPLORATION':
      if (state.phase !== 'intro') return state
      return {
        ...state,
        phase: 'exploration',
        messages: [...state.messages, { role: 'tutor', text: EXPLORATION_PROMPT }],
      }

    case 'FINISH_EXPLORATION':
      if (state.phase !== 'exploration') return state
      return {
        ...state,
        phase: 'guided_discovery',
        messages: [
          ...state.messages,
          { role: 'tutor', text: state.steps[state.currentStepIndex].prompt },
        ],
        attempts: 0,
      }

    case 'CHECK_ANSWER': {
      if (state.phase !== 'guided_discovery' && state.phase !== 'assessment') return state
      const step = state.steps[state.currentStepIndex]

      // For dual-zone steps, both zones must match the target
      if (step.dualZone) {
        const zone1Correct = isAnswerCorrect(
          action.numerator, action.denominator,
          step.targetNumerator, step.targetDenominator,
        )
        const zone2Correct = action.numerator2 !== undefined && action.denominator2 !== undefined
          && isAnswerCorrect(
            action.numerator2, action.denominator2,
            step.targetNumerator, step.targetDenominator,
          )

        if (zone1Correct && zone2Correct) {
          return handleCorrectAnswer(state, step)
        }

        return handleWrongAnswer(state, step)
      }

      const correct = isAnswerCorrect(
        action.numerator,
        action.denominator,
        step.targetNumerator,
        step.targetDenominator,
      )

      if (correct) {
        return handleCorrectAnswer(state, step)
      }

      return handleWrongAnswer(state, step)
    }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

function handleCorrectAnswer(state: LessonState, step: GuidedStep): LessonState {
  const isLastStep = state.currentStepIndex >= state.steps.length - 1
  const newMessages = [
    ...state.messages,
    { role: 'tutor' as const, text: step.successMessage },
  ]

  if (isLastStep) {
    // If we just finished guided_discovery, transition to assessment
    if (state.phase === 'guided_discovery') {
      newMessages.push({ role: 'tutor' as const, text: ASSESSMENT_INTRO })
      newMessages.push({ role: 'tutor' as const, text: ASSESSMENT_STEPS[0].prompt })
      return {
        ...state,
        phase: 'assessment',
        messages: newMessages,
        steps: ASSESSMENT_STEPS,
        currentStepIndex: 0,
        attempts: 0,
      }
    }
    // If we just finished assessment, go to complete
    newMessages.push({ role: 'tutor' as const, text: CELEBRATION })
    return {
      ...state,
      phase: 'complete',
      messages: newMessages,
      attempts: 0,
    }
  }

  return {
    ...state,
    messages: [
      ...newMessages,
      { role: 'tutor' as const, text: state.steps[state.currentStepIndex + 1].prompt },
    ],
    currentStepIndex: state.currentStepIndex + 1,
    attempts: 0,
  }
}

function handleWrongAnswer(state: LessonState, step: GuidedStep): LessonState {
  // On 3rd wrong attempt (attempts >= 2), show walkthrough if available
  if (state.attempts >= 2 && step.walkthrough) {
    return {
      ...state,
      attempts: state.attempts + 1,
      messages: [
        ...state.messages,
        { role: 'tutor', text: step.walkthrough },
      ],
    }
  }

  const hintIndex = Math.min(state.attempts, step.hints.length - 1)
  return {
    ...state,
    attempts: state.attempts + 1,
    messages: [
      ...state.messages,
      { role: 'tutor', text: step.hints[hintIndex] },
    ],
  }
}
