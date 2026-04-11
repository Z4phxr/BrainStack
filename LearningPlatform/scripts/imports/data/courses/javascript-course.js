/**
 * Example full-course import (Payload: subject, course, modules, lessons, tasks).
 * Idempotency keys:
 * - subject, course: slug
 * - module: course + order
 * - lesson: module + order
 * - task: lesson + order + type
 */
module.exports = {
  subject: {
    name: 'Web Development',
    slug: 'web-development',
  },
  course: {
    title: 'JavaScript Basics',
    slug: 'javascript-basics',
    description: 'A short intro course used as an import smoke test.',
    level: 'BEGINNER',
    isPublished: false,
  },
  modules: [
    {
      title: 'Getting started',
      order: 1,
      lessons: [
        {
          title: 'What is JavaScript?',
          order: 1,
          theoryBlocks: [
            {
              blockType: 'text',
              content:
                'JavaScript is a programming language that runs in browsers and on servers (Node.js).',
            },
          ],
          tasks: [
            {
              type: 'TRUE_FALSE',
              order: 1,
              prompt: 'JavaScript can run inside a web browser.',
              correctAnswer: 'true',
              tagSlugs: ['javascript', 'basics'],
              points: 1,
            },
          ],
        },
      ],
    },
  ],
}
