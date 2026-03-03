import type { CollectionConfig } from 'payload'
import { toSlug } from '../../../lib/utils'

export const Subjects: CollectionConfig = {
  slug: 'subjects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'ADMIN',
    update: ({ req: { user } }) => user?.role === 'ADMIN',
    delete: ({ req: { user } }) => user?.role === 'ADMIN',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Subject name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [({ data, value }) => {
          const raw = typeof value === 'string' && value.trim().length > 0 ? value : (data?.name || '')
          return raw ? toSlug(raw) : value
        }],
      },
      label: 'Slug',
    },
  ],
}
