/** User-facing presets for POST /api/lesson-assistant. */
export type LessonAssistantModelPreset = 'haiku' | 'sonnet'

const DEFAULT_HAIKU_ID = 'claude-haiku-4-5'
const DEFAULT_SONNET_ID = 'claude-sonnet-4-5'

/**
 * Maps preset → Anthropic Messages API `model` id.
 * `ANTHROPIC_MODEL` overrides Haiku only (backward compatible).
 * `ANTHROPIC_SONNET_MODEL` optionally pins Sonnet snapshot/alias.
 */
export function resolveLessonAssistantModelId(preset: LessonAssistantModelPreset): string {
  if (preset === 'sonnet') {
    return process.env.ANTHROPIC_SONNET_MODEL?.trim() || DEFAULT_SONNET_ID
  }
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_HAIKU_ID
}
