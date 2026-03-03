import { Block } from 'payload'

export const TextBlock: Block = {
  slug: 'text',
  labels: {
    singular: 'Text block',
    plural: 'Text blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
    },
  ],
}
