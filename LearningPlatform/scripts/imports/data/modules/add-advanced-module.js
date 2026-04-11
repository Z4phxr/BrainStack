/**
 * Example: append a module to an existing course (matched by `courseSlug`).
 * Safe to re-run: module rows are keyed by (course, order).
 */
module.exports = {
  courseSlug: 'javascript-basics',
  module: {
    title: 'Advanced Topics',
    order: 2,
    lessons: [
      {
        title: 'Closures',
        order: 1,
        theoryBlocks: [
          {
            blockType: 'text',
            content: 'A closure lets a function retain access to variables from its outer scope.',
          },
        ],
        tasks: [
          {
            type: 'OPEN_ENDED',
            order: 1,
            prompt: 'In one sentence, explain what a closure is.',
            tagSlugs: ['javascript'],
            points: 2,
            autoGrade: false,
          },
        ],
      },
    ],
  },
}
