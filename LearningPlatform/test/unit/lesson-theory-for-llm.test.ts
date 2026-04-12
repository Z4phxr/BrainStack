import { describe, it, expect } from 'vitest'
import {
  buildLessonTheoryForLlm,
  courseLevelLabel,
  serializeLessonTheoryForLlm,
  truncateTheoryText,
} from '@/lib/lesson-theory-for-llm'

describe('courseLevelLabel', () => {
  it('maps known levels', () => {
    expect(courseLevelLabel('BEGINNER')).toBe('Beginner')
    expect(courseLevelLabel('INTERMEDIATE')).toBe('Intermediate')
    expect(courseLevelLabel('ADVANCED')).toBe('Advanced')
  })
})

describe('serializeLessonTheoryForLlm', () => {
  it('serializes a math block', () => {
    const md = serializeLessonTheoryForLlm({
      theoryBlocks: [{ blockType: 'math', latex: 'x^2', displayMode: false }],
    })
    expect(md).toContain('x^2')
    expect(md).toContain('Math')
  })

  it('uses legacy string content when no blocks', () => {
    expect(serializeLessonTheoryForLlm({ content: 'Hello **world**' })).toContain('Hello')
  })
})

describe('truncateTheoryText', () => {
  it('does not truncate short text', () => {
    const { text, truncated } = truncateTheoryText('abc', 100)
    expect(truncated).toBe(false)
    expect(text).toBe('abc')
  })

  it('truncates long text', () => {
    const { text, truncated } = truncateTheoryText('x'.repeat(20), 10)
    expect(truncated).toBe(true)
    expect(text.length).toBeLessThanOrEqual(200)
    expect(text.startsWith('xxxxxxxxxx')).toBe(true)
  })
})

describe('buildLessonTheoryForLlm', () => {
  it('returns truncated flag when over limit', () => {
    const huge = 'y'.repeat(100)
    const { truncated } = buildLessonTheoryForLlm(
      { content: huge },
      50,
    )
    expect(truncated).toBe(true)
  })
})
