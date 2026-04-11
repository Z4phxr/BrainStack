/**
 * Single source of truth for how task answers are scored (matches submit-task.ts / lesson flow).
 */

export type EvaluatableTask = {
  type: string
  correctAnswer?: string | null
  autoGrade?: boolean | null
}

/**
 * @returns isCorrect — meaningful when autoGraded is true; when autoGraded is false (manual open-ended),
 *          isCorrect is still false for DB parity but clients should ignore it and show "manual review".
 */
export function evaluateTaskAnswer(task: EvaluatableTask, answer: string): {
  isCorrect: boolean
  autoGraded: boolean
} {
  if (task.type === 'MULTIPLE_CHOICE' || task.type === 'TRUE_FALSE') {
    return {
      isCorrect: answer === task.correctAnswer,
      autoGraded: true,
    }
  }

  if (task.type === 'OPEN_ENDED') {
    if (!task.autoGrade) {
      return { isCorrect: false, autoGraded: false }
    }

    const normalize = (s: string) =>
      (s || '')
        .toString()
        .normalize('NFKD')
        .replace(/[^A-Za-z0-9]+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')

    const userAnswer = normalize(answer)
    const expected = normalize(task.correctAnswer ?? '')
    return {
      isCorrect: userAnswer === expected,
      autoGraded: true,
    }
  }

  return { isCorrect: false, autoGraded: true }
}
