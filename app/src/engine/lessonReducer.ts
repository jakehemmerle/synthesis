import type { LessonState, LessonAction } from './types'
import { GREETING, EXPLORATION_PROMPT, GUIDED_STEPS, CELEBRATION } from './lessonScript'

export const initialState: LessonState = {
  phase: 'idle',
  messages: [],
  currentStepIndex: 0,
  steps: [],
  attempts: 0,
}

function isAnswerCorrect(
  answerN: number,
  answerD: number,
  targetN: number,
  targetD: number,
): boolean {
  if (answerD === 0 || targetD === 0) return false
  return Math.abs(answerN / answerD - targetN / targetD) < 0.001
}

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'START_LESSON':
      return {
        ...state,
        phase: 'intro',
        messages: [...state.messages, { role: 'tutor', text: GREETING }],
        steps: GUIDED_STEPS,
        currentStepIndex: 0,
        attempts: 0,
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
      if (state.phase !== 'guided_discovery') return state
      const step = state.steps[state.currentStepIndex]
      const correct = isAnswerCorrect(
        action.numerator,
        action.denominator,
        step.targetNumerator,
        step.targetDenominator,
      )

      if (correct) {
        const isLastStep = state.currentStepIndex >= state.steps.length - 1
        const newMessages = [
          ...state.messages,
          { role: 'tutor' as const, text: step.successMessage },
        ]
        if (isLastStep) {
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

      // Wrong answer — give hint
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

    case 'RESET':
      return initialState

    default:
      return state
  }
}
