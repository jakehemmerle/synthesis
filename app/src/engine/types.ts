export interface ChatMessage {
  role: 'tutor' | 'student'
  text: string
}

export type LessonPhase =
  | 'idle'
  | 'intro'
  | 'exploration'
  | 'guided_discovery'
  | 'complete'

export interface GuidedStep {
  id: string
  prompt: string
  targetNumerator: number
  targetDenominator: number
  hints: string[]
  successMessage: string
}

export interface LessonState {
  phase: LessonPhase
  messages: ChatMessage[]
  currentStepIndex: number
  steps: GuidedStep[]
  attempts: number
}

export type LessonAction =
  | { type: 'START_LESSON' }
  | { type: 'BEGIN_EXPLORATION' }
  | { type: 'FINISH_EXPLORATION' }
  | { type: 'CHECK_ANSWER'; numerator: number; denominator: number }
  | { type: 'RESET' }
