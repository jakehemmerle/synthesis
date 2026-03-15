import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { LessonState, LessonAction } from './types'
import { lessonReducer, initialState } from './lessonReducer'

interface LessonContextValue {
  state: LessonState
  dispatch: React.Dispatch<LessonAction>
}

const LessonContext = createContext<LessonContextValue | null>(null)

export function LessonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(lessonReducer, initialState)

  useEffect(() => {
    if (state.phase === 'idle') {
      dispatch({ type: 'START_LESSON' })
    }
  }, [state.phase])

  return (
    <LessonContext.Provider value={{ state, dispatch }}>
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
