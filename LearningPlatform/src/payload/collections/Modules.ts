import type { CollectionConfig } from 'payload'
import { prisma } from '../../../lib/prisma'
import { deleteLessonsAttachingToModule } from '../lib/content-cascade-delete'

export const Modules: CollectionConfig = {
  slug: 'modules',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'order', 'isPublished'],
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        await deleteLessonsAttachingToModule(req.payload, String(id), req)
      },
    ],
    afterChange: [
      async ({ doc }) => {
        const moduleId = String(doc?.id ?? '').trim()
        const moduleTitle = typeof doc?.title === 'string' ? doc.title.trim() : ''
        if (!moduleId || !moduleTitle) return
        try {
          await prisma.flashcardDeck.updateMany({
            where: { moduleId },
            data: { name: moduleTitle },
          })
        } catch (error) {
          console.error('[Modules.afterChange] failed to sync subdeck names', error)
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
      name: 'title',
      type: 'text',
      required: true,
      label: 'Module title',
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 1,
      label: 'Order',
      admin: {
        description: 'Controls the display order of modules',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      label: 'Published',
    },
  ],
}
