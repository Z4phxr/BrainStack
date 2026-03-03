import type { Block } from 'payload'

export const TableBlock: Block = {
  slug: 'table',
  labels: {
    singular: 'Table',
    plural: 'Tables',
  },
  fields: [
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
      admin: {
        description: 'Table caption – displayed above the table',
        placeholder: 'e.g. Comparison of algorithm complexities',
      },
    },
    {
      name: 'hasHeaders',
      type: 'checkbox',
      label: 'Column headers',
      defaultValue: true,
      admin: {
        description: 'First row is treated as a header row',
      },
    },
    {
      name: 'headers',
      type: 'json',
      label: 'Column headers',
      admin: {
        description: 'Array of column header strings (set automatically by the editor)',
      },
    },
    {
      name: 'rows',
      type: 'json',
      label: 'Table rows',
      admin: {
        description: 'Array of rows – each row is an array of cell strings',
      },
    },
  ],
}
