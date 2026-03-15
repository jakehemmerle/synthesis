import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react'
import type { LessonState, LessonAction } from './types'
import { lessonReducer, initialState } from './lessonReducer'

interface LessonContextValue {
  state: LessonState
  dispatch: React.Dispatch<LessonAction>
}

const LessonContext = createContext<LessonContextValue | null>(null)

export function LessonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(lessonReducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])

  return (
    <LessonContext.Provider value={value}>
      {children}
    </LessonContext.Provider>
  )
}

export function useLesson(): LessonContextValue {
  const ctx = useContext(LessonContext)
  if (!ctx) {
    throw new Error('useLesson must be used within a LessonProvider')
  }
  return ctx
}
