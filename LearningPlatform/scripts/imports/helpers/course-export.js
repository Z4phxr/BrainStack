const {
  lexicalToPlainText,
  omitUndefined,
  mediaRefForImport,
} = require('./export-utils')

const OA = { overrideAccess: true }

async function findAll(payload, collection, where, sort) {
  const docs = []
  let page = 1
  for (;;) {
    const res = await payload.find({
      collection,
      where,
      sort,
      limit: 100,
      page,
      depth: 2,
      ...OA,
    })
    docs.push(...res.docs)
    if (!res.hasNextPage) break
    page += 1
  }
  return docs
}

function exportTheoryBlock(block, mediaById) {
  if (!block || typeof block !== 'object') return null
  const type = block.blockType
  if (!type) return null

  if (type === 'text' || type === 'callout') {
    return omitUndefined({
      blockType: type,
      ...(type === 'callout' && block.variant != null ? { variant: block.variant } : {}),
      ...(type === 'callout' && block.title != null ? { title: block.title } : {}),
      content: lexicalToPlainText(block.content),
    })
  }

  if (type === 'image') {
    const imageId =
      typeof block.image === 'object' && block.image != null
        ? block.image.id
        : block.image
    const image = mediaRefForImport(imageId, mediaById)
    return omitUndefined({
      blockType: 'image',
      image,
      caption: block.caption ?? undefined,
      align: block.align ?? undefined,
      width: block.width ?? undefined,
    })
  }

  if (type === 'video') {
    return omitUndefined({
      blockType: 'video',
      videoUrl: block.videoUrl ?? '',
      title: block.title ?? undefined,
      caption: block.caption ?? undefined,
      aspectRatio: block.aspectRatio === '4:3' ? '4:3' : '16:9',
    })
  }

  if (type === 'math') {
    return omitUndefined({
      blockType: 'math',
      latex: block.latex ?? '',
      displayMode: block.displayMode ?? undefined,
      note: block.note ?? undefined,
    })
  }

  if (type === 'table') {
    return omitUndefined({
      blockType: 'table',
      caption: block.caption ?? undefined,
      hasHeaders: block.hasHeaders !== false,
      headers: block.headers ?? undefined,
      rows: block.rows ?? undefined,
    })
  }

  return omitUndefined({ ...block, blockType: type })
}

function exportTask(task) {
  const tagSlugs = Array.isArray(task.tags)
    ? task.tags.map((t) => t?.slug).filter(Boolean)
    : []

  const out = omitUndefined({
    type: task.type,
    order: task.order,
    prompt: lexicalToPlainText(task.prompt),
    tagSlugs,
    points: typeof task.points === 'number' ? task.points : 1,
    correctAnswer:
      typeof task.correctAnswer === 'string' ? task.correctAnswer : undefined,
    autoGrade: typeof task.autoGrade === 'boolean' ? task.autoGrade : undefined,
    solution: task.solution ? lexicalToPlainText(task.solution) : undefined,
    solutionVideoUrl:
      typeof task.solutionVideoUrl === 'string' && task.solutionVideoUrl.trim()
        ? task.solutionVideoUrl.trim()
        : undefined,
    isPublished: task.isPublished === false ? false : undefined,
  })

  if (Array.isArray(task.choices) && task.choices.length > 0) {
    out.choices = task.choices.map((c) => {
      if (c && typeof c === 'object' && typeof c.text === 'string') {
        return { text: c.text }
      }
      return { text: String(c) }
    })
  }

  return out
}

function exportLesson(lesson, mediaById) {
  const blocks = Array.isArray(lesson.theoryBlocks)
    ? lesson.theoryBlocks.map((b) => exportTheoryBlock(b, mediaById)).filter(Boolean)
    : []

  return omitUndefined({
    title: lesson.title,
    order: lesson.order,
    theoryBlocks: blocks,
    tasks: [],
    isPublished: lesson.isPublished === false ? false : undefined,
  })
}

async function exportCourseStructure(payload, courseDoc, mediaById) {
  const courseId = String(courseDoc.id)

  let subject = { name: 'General', slug: 'general' }
  if (courseDoc.subject) {
    if (typeof courseDoc.subject === 'object') {
      subject = {
        name: courseDoc.subject.name || subject.name,
        slug: courseDoc.subject.slug || subject.slug,
      }
    } else {
      const sub = await payload.findByID({
        collection: 'subjects',
        id: courseDoc.subject,
        ...OA,
      })
      if (sub) {
        subject = { name: sub.name, slug: sub.slug }
      }
    }
  }

  const course = omitUndefined({
    title: courseDoc.title,
    slug: courseDoc.slug,
    description: lexicalToPlainText(courseDoc.description),
    level: courseDoc.level || 'BEGINNER',
    isPublished: courseDoc.isPublished === false ? false : undefined,
    coverImage: (() => {
      const cover = courseDoc.coverImage
      const coverId =
        typeof cover === 'object' && cover != null ? cover.id : cover
      if (coverId == null) return undefined
      return mediaRefForImport(coverId, mediaById)
    })(),
  })

  const modules = await findAll(
    payload,
    'modules',
    { course: { equals: courseId } },
    'order',
  )

  const exportedModules = []

  for (const mod of modules) {
    const moduleId = String(mod.id)
    const lessons = await findAll(
      payload,
      'lessons',
      {
        and: [{ course: { equals: courseId } }, { module: { equals: moduleId } }],
      },
      'order',
    )

    const exportedLessons = []
    for (const lesson of lessons) {
      const lessonExport = exportLesson(lesson, mediaById)
      const tasks = await findAll(
        payload,
        'tasks',
        { lesson: { contains: String(lesson.id) } },
        'order',
      )
      lessonExport.tasks = tasks.map(exportTask)
      exportedLessons.push(lessonExport)
    }

    exportedModules.push(
      omitUndefined({
        title: mod.title,
        order: mod.order,
        isPublished: mod.isPublished === false ? false : undefined,
        lessons: exportedLessons,
      }),
    )
  }

  return {
    subject,
    course,
    modules: exportedModules,
  }
}

async function exportAllCourses(payload) {
  return findAll(payload, 'courses', {}, '-createdAt')
}

module.exports = {
  exportCourseStructure,
  exportAllCourses,
}
