import type { CollectionConfig } from 'payload'
import { prisma } from '@/lib/prisma'
import { sanitizeTasksMediaRefs } from '@/lib/sanitize-payload-media-refs'

/** Extract plain-text from a Lexical richText JSON object. */
function lexicalToPlainText(lexical: unknown): string {
  if (!lexical || typeof lexical !== 'object') return ''
  const root = (lexical as any).root
  if (!root) return ''
  const texts: string[] = []
  function walk(node: any) {
    if (node?.text) texts.push(node.text)
    if (Array.isArray(node?.children)) node.children.forEach(walk)
  }
  walk(root)
  return texts.join(' ').slice(0, 120)
}

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'lesson', 'type', 'points', 'order', 'isPublished'],
  },
  hooks: {
    beforeRead: [
      ({ doc }) => {
        sanitizeTasksMediaRefs(doc)
        return doc
      },
    ],
    beforeChange: [
      ({ data }) => {
        // Auto-generate title from prompt if caller didn't supply one
        if (!data.title) {
          const fromPrompt = lexicalToPlainText(data.prompt)
          data.title = fromPrompt || `Task (${data.type ?? 'TASK'})`
        }
        return data
      },
    ],
    afterDelete: [
      async ({ id }) => {
        // Clean up any TaskProgress records that reference this now-deleted task.
        // Without this, orphaned rows would remain indefinitely (no DB-level FK).
        try {
          await prisma.taskProgress.deleteMany({
            where: { taskId: String(id) },
          })
        } catch (err) {
          console.error('[Tasks afterDelete] Failed to clean TaskProgress:', err)
        }
      },
    ],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'ADMIN') return true
      return {
        isPublished: {
          equals: true,
        },
      }
    },
    create: ({ req: { user } }) => user?.role === 'ADMIN',
    update: ({ req: { user } }) => user?.role === 'ADMIN',
    delete: ({ req: { user } }) => user?.role === 'ADMIN',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      // Auto-populated by the beforeChange hook; hidden in admin (prompt is the real content)
      admin: { hidden: true },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      hasMany: true,
      required: false,
      label: 'Lessons',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Multiple choice',
          value: 'MULTIPLE_CHOICE',
        },
        {
          label: 'Open ended',
          value: 'OPEN_ENDED',
        },
        {
          label: 'True/False',
          value: 'TRUE_FALSE',
        },
      ],
      label: 'Task type',
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags (link to shared tag list)',
      admin: {
        description: 'Select tags from the shared tag list (used for analytics).',
      },
      fields: [
        {
          name: 'tagId',
          type: 'text',
          label: 'Tag ID',
          admin: {
            description: 'Reference to Prisma Tag.id (canonical)',
            hidden: true,
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Tag name',
        },
        {
          name: 'slug',
          type: 'text',
          admin: { description: 'Tag slug (for lookup)', hidden: true },
        },
      ],
    },
    {
      name: 'prompt',
      type: 'richText',
      required: true,
      label: 'Task prompt',
      admin: {
        description: 'Use headings, formatting, and lists for readability',
      },
    },
    {
      name: 'questionMedia',
      type: 'upload',
      relationTo: 'media',
      label: 'Question media (optional)',
      admin: {
        description: 'Image for the task prompt',
      },
    },
    {
      name: 'choices',
      type: 'array',
      label: 'Choices (multiple choice only)',
      admin: {
        condition: (data) => data.type === 'MULTIPLE_CHOICE',
        description: 'Add possible answers',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          label: 'Choice text',
        },
      ],
    },
    {
      name: 'correctAnswer',
      type: 'text',
      label: 'Correct answer',
      admin: {
        condition: (data) => data.type === 'MULTIPLE_CHOICE' || data.type === 'TRUE_FALSE',
        description: 'For MC: exact answer text, for T/F: "true" or "false"',
      },
    },
    {
      name: 'autoGrade',
      type: 'checkbox',
      label: 'Auto-grade (open-ended)',
      defaultValue: false,
      admin: {
        condition: (data) => data.type === 'OPEN_ENDED',
        description: 'When checked (for open-ended tasks), the system will attempt to auto-grade answers by comparing normalized text (case- and punctuation-insensitive).',
      },
    },
    {
      name: 'solution',
      type: 'richText',
      label: 'Solution / Explanation',
      admin: {
        description: 'Detailed explanation of the solution',
      },
    },
    {
      name: 'solutionMedia',
      type: 'upload',
      relationTo: 'media',
      label: 'Solution media (optional)',
      admin: {
        description: 'Image supporting the solution',
      },
    },
    {
      name: 'solutionVideoUrl',
      type: 'text',
      label: 'Solution video URL (optional)',
      admin: {
        description: 'YouTube or other video URL shown in the solution',
      },
    },
    {
      name: 'points',
      type: 'number',
      required: true,
      defaultValue: 1,
      label: 'Points',
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 1,
      label: 'Order',
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      label: 'Published',
    },
  ],
}
