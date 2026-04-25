export function courseIdFromPayloadTask(task: unknown): string | null {
  const lesson = (task as { lesson?: unknown } | null)?.lesson
  if (!lesson || typeof lesson !== 'object') return null

  const course = (lesson as { course?: unknown }).course
  if (!course) return null

  if (typeof course === 'string' || typeof course === 'number') {
    return String(course)
  }
  if (typeof course === 'object' && 'id' in course) {
    return String((course as { id: string | number }).id)
  }
  return null
}
