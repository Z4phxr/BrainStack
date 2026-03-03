import { Block } from 'payload'

export const MathBlock: Block = {
  slug: 'math',
  labels: {
    singular: 'Math block',
    plural: 'Math blocks',
  },
  fields: [
    {
      name: 'latex',
      type: 'textarea',
      label: 'LaTeX formula',
      required: true,
      admin: {
        placeholder: 'e.g. x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        description: 'Enter the formula in LaTeX format (without $$ or $)',
      },
    },
    {
      name: 'displayMode',
      type: 'checkbox',
      label: 'Display mode',
      defaultValue: true,
      admin: {
        description: 'Use block mode for large formulas. Disable for inline formulas.',
      },
    },
    {
      name: 'note',
      type: 'text',
      label: 'Note (optional)',
      admin: {
        placeholder: 'e.g. Quadratic formula',
      },
    },
  ],
}
