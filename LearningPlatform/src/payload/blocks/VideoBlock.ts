import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  labels: {
    singular: 'Video',
    plural: 'Video',
  },
  fields: [
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      label: 'Video URL',
      admin: {
        description: 'YouTube link only',
        placeholder: 'https://www.youtube.com/watch?v=...',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title (optional)',
      admin: {
        description: 'Title displayed above the video',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
      admin: {
        description: 'Caption shown below the video',
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      required: true,
      defaultValue: '16:9',
      options: [
        {
          label: '16:9 (Widescreen)',
          value: '16:9',
        },
        {
          label: '4:3 (Standard)',
          value: '4:3',
        },
      ],
      label: 'Aspect ratio',
    },
  ],
}
