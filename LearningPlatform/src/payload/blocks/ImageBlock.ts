import { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  labels: {
    singular: 'Image block',
    plural: 'Image blocks',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
    },
    {
      name: 'align',
      type: 'select',
      label: 'Alignment',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      name: 'width',
      type: 'select',
      label: 'Width',
      defaultValue: 'md',
      options: [
        { label: 'Small (400px)', value: 'sm' },
        { label: 'Medium (600px)', value: 'md' },
        { label: 'Large (800px)', value: 'lg' },
        { label: 'Full width', value: 'full' },
      ],
    },
  ],
}
