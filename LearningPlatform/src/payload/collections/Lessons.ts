import type { CollectionConfig } from 'payload'
import { TextBlock, ImageBlock, MathBlock, CalloutBlock, VideoBlock, TableBlock } from '../blocks'
import { prisma } from '@/lib/prisma'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'module', 'order', 'isPublished'],
  },
  hooks: {
    afterDelete: [
      async ({ id }) => {
        // Clean up LessonProgress records (TaskProgress is cascade-deleted by Prisma).
        // Without this, orphaned rows remain since there's no DB-level FK to Payload.
        try {
          await prisma.lessonProgress.deleteMany({
            where: { lessonId: String(id) },
          })
        } catch (err) {
          console.error('[Lessons afterDelete] Failed to clean LessonProgress:', err)
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
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Course',
    },
    {
      name: 'module',
      type: 'relationship',
      relationTo: 'modules',
      required: true,
      label: 'Module',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Lesson title',
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 1,
      label: 'Order',
    },
    {
      name: 'theoryBlocks',
      type: 'blocks',
      label: 'Lesson content',
      blocks: [TextBlock, ImageBlock, MathBlock, CalloutBlock, VideoBlock, TableBlock],
      admin: {
        description: 'Add blocks: text, images, math, callouts, video, table',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: '[Deprecated] Legacy lesson content',
      admin: {
        description: 'This field is deprecated. Use "Lesson content" above.',
        condition: (data) => !data.theoryBlocks || data.theoryBlocks.length === 0,
      },
    },
    {
      name: 'lastUpdatedBy',
      type: 'text',
      label: 'Last updated by',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'attachments',
      type: 'array',
      label: 'Attachments',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Attachment description',
        },
      ],
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      label: 'Published',
    },
  ],
}
