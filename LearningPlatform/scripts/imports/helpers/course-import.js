const fs = require('fs')
const path = require('path')
const { textToLexical } = require('./utils')
const { getTaskTagObjectsBySlug } = require('./tags')

const ALLOWED_CALLOUT_VARIANTS = new Set(['info', 'warning', 'tip'])

/** AI/import scripts: use this string for `image` — resolved to bundled SVG media on import. See `scripts/imports/AI_THEORY_BLOCKS.md`. */
const IMPORT_PLACEHOLDER_IMAGE_TOKEN = '__IMPORT_PLACEHOLDER_IMAGE__'
const PLACEHOLDER_MEDIA_FILENAME = 'lesson-theory-placeholder.svg'

/** Import scripts run without an admin session; bypass collection access so find/create/update work. */
const OA = { overrideAccess: true }

function normalizeCalloutVariant(variant) {
  if (ALLOWED_CALLOUT_VARIANTS.has(variant)) return variant
  if (variant === 'danger') return 'warning'
  return 'info'
}

function toTheoryBlocks(theoryBlocks) {
  const blocks = Array.isArray(theoryBlocks) ? theoryBlocks : []
  return blocks.map((block) => {
    if (block.blockType === 'text' || block.blockType === 'callout') {
      const normalizedBlock = {
        ...block,
        content: textToLexical(block.content),
      }

      if (normalizedBlock.blockType === 'callout') {
        normalizedBlock.variant = normalizeCalloutVariant(normalizedBlock.variant)
      }

      return normalizedBlock
    }

    if (block.blockType === 'video') {
      return {
        ...block,
        videoUrl: String(block.videoUrl ?? ''),
        aspectRatio: block.aspectRatio === '4:3' ? '4:3' : '16:9',
      }
    }

    return block
  })
}

async function ensureLessonPlaceholderMedia(payload) {
  const existing = await findSingle(payload, 'media', {
    filename: { equals: PLACEHOLDER_MEDIA_FILENAME },
  })
  if (existing) {
    return existing
  }

  const assetPath = path.join(__dirname, '../assets', PLACEHOLDER_MEDIA_FILENAME)
  const publicMediaDir = path.join(process.cwd(), 'public', 'media')
  const destPath = path.join(publicMediaDir, PLACEHOLDER_MEDIA_FILENAME)

  if (!fs.existsSync(assetPath)) {
    throw new Error(
      `[ERROR] Placeholder asset missing: ${assetPath}. Expected bundled ${PLACEHOLDER_MEDIA_FILENAME}`,
    )
  }

  if (!fs.existsSync(publicMediaDir)) {
    fs.mkdirSync(publicMediaDir, { recursive: true })
  }

  fs.copyFileSync(assetPath, destPath)

  const buf = fs.readFileSync(destPath)
  const publicUrl = `/api/media/serve/${encodeURIComponent(PLACEHOLDER_MEDIA_FILENAME)}`

  const created = await payload.create({
    collection: 'media',
    data: {
      filename: PLACEHOLDER_MEDIA_FILENAME,
      mimeType: 'image/svg+xml',
      filesize: buf.length,
      alt: 'Lesson theory placeholder (course imports) — replace in Admin → Media if desired',
      url: publicUrl,
    },
    ...OA,
  })

  console.log(
    `[INFO] Registered placeholder media for theory image blocks: id=${created.id} file=${PLACEHOLDER_MEDIA_FILENAME}`,
  )
  return created
}

const IMPORT_ASSET_IMAGE_RE = /\.(png|jpe?g|gif|webp|svg)$/i

/**
 * Copy `scripts/imports/assets/<filename>` → public/media, create a Media row (by filename).
 * Use for course covers or any import-time image referenced by basename.
 */
async function ensureMediaFromImportAsset(payload, filename) {
  const safeName = path.basename(String(filename))
  if (!IMPORT_ASSET_IMAGE_RE.test(safeName)) {
    throw new Error(
      `[ERROR] Invalid import asset name "${filename}" — use a basename under scripts/imports/assets/ with extension .png, .jpg, .jpeg, .webp, .gif, or .svg`,
    )
  }

  const existing = await findSingle(payload, 'media', {
    filename: { equals: safeName },
  })
  if (existing) {
    return existing
  }

  const assetPath = path.join(__dirname, '../assets', safeName)
  const publicMediaDir = path.join(process.cwd(), 'public', 'media')
  const destPath = path.join(publicMediaDir, safeName)

  if (!fs.existsSync(assetPath)) {
    throw new Error(
      `[ERROR] Import asset missing: ${assetPath}. Add the file to scripts/imports/assets/ (same folder as ${PLACEHOLDER_MEDIA_FILENAME}).`,
    )
  }

  if (!fs.existsSync(publicMediaDir)) {
    fs.mkdirSync(publicMediaDir, { recursive: true })
  }

  fs.copyFileSync(assetPath, destPath)

  const buf = fs.readFileSync(destPath)
  const ext = path.extname(safeName).toLowerCase()
  const mime =
    ext === '.svg'
      ? 'image/svg+xml'
      : ext === '.png'
        ? 'image/png'
        : ext === '.webp'
          ? 'image/webp'
          : ext === '.gif'
            ? 'image/gif'
            : 'image/jpeg'
  const publicUrl = `/api/media/serve/${encodeURIComponent(safeName)}`

  const created = await payload.create({
    collection: 'media',
    data: {
      filename: safeName,
      mimeType: mime,
      filesize: buf.length,
      alt: safeName,
      url: publicUrl,
    },
    ...OA,
  })

  console.log(`[INFO] Registered import media: id=${created.id} file=${safeName}`)
  return created
}

/**
 * Course `coverImage` in import JS:
 * - omit / undefined → do not change cover on import (no automatic placeholder)
 * - `null` → clear cover
 * - `__IMPORT_PLACEHOLDER_IMAGE__` / `__PLACEHOLDER__` → bundled lesson-theory-placeholder.svg (explicit only)
 * - `"my-cover.jpg"` → file in scripts/imports/assets/
 * - numeric id → existing Media row
 */
async function resolveCourseCoverForImport(payload, raw, { dryRun }) {
  if (dryRun) {
    return undefined
  }
  if (raw === null) {
    return null
  }
  if (raw === undefined) {
    return undefined
  }
  if (raw === IMPORT_PLACEHOLDER_IMAGE_TOKEN || raw === '__PLACEHOLDER__') {
    const doc = await ensureLessonPlaceholderMedia(payload)
    return doc.id
  }
  if (typeof raw === 'number' || (typeof raw === 'string' && /^\d+$/.test(String(raw).trim()))) {
    return Number(raw)
  }
  if (typeof raw === 'string') {
    const doc = await ensureMediaFromImportAsset(payload, raw)
    return doc.id
  }
  return undefined
}

/**
 * Replace import tokens in theory blocks with real Media IDs before save.
 * @param {unknown[]|undefined} theoryBlocks
 */
async function resolveTheoryBlockMediaRefs(payload, theoryBlocks, { dryRun }) {
  if (!Array.isArray(theoryBlocks) || theoryBlocks.length === 0) {
    return theoryBlocks
  }
  if (dryRun) {
    return theoryBlocks
  }

  let placeholderId = null
  const getPlaceholderId = async () => {
    if (placeholderId != null) {
      return placeholderId
    }
    const doc = await ensureLessonPlaceholderMedia(payload)
    placeholderId = String(doc.id)
    return placeholderId
  }

  const out = []
  for (const block of theoryBlocks) {
    if (!block || typeof block !== 'object') {
      out.push(block)
      continue
    }
    const next = { ...block }
    if (block.blockType === 'image') {
      const img = block.image
      if (img === IMPORT_PLACEHOLDER_IMAGE_TOKEN || img === '__PLACEHOLDER__') {
        next.image = await getPlaceholderId()
      }
    }
    out.push(next)
  }
  return out
}

function toTaskData(task, lessonId, tags) {
  const payloadTask = {
    lesson: [lessonId],
    type: task.type,
    prompt: textToLexical(task.prompt),
    tags,
    points: typeof task.points === 'number' ? task.points : 1,
    order: task.order,
    isPublished: task.isPublished !== false,
  }

  if (task.choices) {
    payloadTask.choices = task.choices.map((choice) => {
      if (choice && typeof choice === 'object' && typeof choice.text === 'string') {
        return { text: choice.text }
      }

      return { text: String(choice) }
    })
  }

  if (typeof task.correctAnswer === 'string') {
    payloadTask.correctAnswer = task.correctAnswer
  }

  if (typeof payloadTask.correctAnswer !== 'string' && task.type === 'OPEN_ENDED') {
    payloadTask.correctAnswer = ''
  }

  if (task.solution) {
    payloadTask.solution = textToLexical(task.solution)
  }

  if (typeof task.autoGrade === 'boolean') {
    payloadTask.autoGrade = task.autoGrade
  }

  return payloadTask
}

async function findSingle(payload, collection, where) {
  const existing = await payload.find({
    collection,
    where,
    limit: 1,
    ...OA,
  })

  return existing.docs[0] ?? null
}

async function syncCreateOrUpdate(payload, collection, where, createData, updateData, { dryRun }) {
  const existing = await findSingle(payload, collection, where)

  if (existing) {
    if (dryRun) {
      console.log(`[DRY-RUN] [UPDATE] ${collection} ${existing.id}`)
      return { doc: existing, created: false, updated: true }
    }

    const updated = await payload.update({
      collection,
      id: existing.id,
      data: updateData,
      ...OA,
    })

    return { doc: updated, created: false, updated: true }
  }

  if (dryRun) {
    console.log(`[DRY-RUN] [CREATE] ${collection}`)
    return { doc: null, created: true, updated: false }
  }

  const created = await payload.create({
    collection,
    data: createData,
    ...OA,
  })

  return { doc: created, created: true, updated: false }
}

async function createOrGetSubject(payload, subjectData, { dryRun }) {
  const result = await syncCreateOrUpdate(
    payload,
    'subjects',
    { slug: { equals: subjectData.slug } },
    {
      name: subjectData.name,
      slug: subjectData.slug,
    },
    {
      name: subjectData.name,
      slug: subjectData.slug,
    },
    { dryRun },
  )

  if (!dryRun) {
    if (result.created) {
      console.log(`[CREATE] Subject: ${result.doc.name} (${subjectData.slug})`)
    } else {
      console.log(`[UPDATE] Subject: ${result.doc.name} (${subjectData.slug})`)
    }
  }

  return result.doc
}

async function findOrCreateCourse(payload, courseData, subjectId, { dryRun, skipUpdateIfExists = false }) {
  if (skipUpdateIfExists) {
    const existingCourse = await findSingle(payload, 'courses', { slug: { equals: courseData.slug } })
    if (existingCourse) {
      if (dryRun) {
        console.log(
          `[DRY-RUN] [SKIP] Course "${courseData.slug}" already exists — would not update course or module tree.`,
        )
      } else {
        console.log(
          `[SKIP] Course "${courseData.slug}" already exists — leaving course and tree unchanged (CONTENT_IMPORT_SKIP_EXISTING_COURSES).`,
        )
      }
      return { doc: existingCourse, created: false, updated: false }
    }
  }

  const coverImage = await resolveCourseCoverForImport(payload, courseData.coverImage, { dryRun })

  const baseData = {
    title: courseData.title,
    slug: courseData.slug,
    description: textToLexical(courseData.description ?? ''),
    level: courseData.level || 'BEGINNER',
    subject: subjectId,
    isPublished: courseData.isPublished !== false,
  }

  const coursePayload =
    dryRun || coverImage === undefined
      ? baseData
      : { ...baseData, coverImage }

  /** Create: mark import origin. Update: omit createdVia/lastUpdatedBy so admin edits stay attributed. */
  const createPayload = { ...coursePayload, createdVia: 'import' }

  const result = await syncCreateOrUpdate(
    payload,
    'courses',
    { slug: { equals: courseData.slug } },
    createPayload,
    coursePayload,
    { dryRun },
  )

  if (result.created) {
    console.log(`[CREATE] Course: ${courseData.slug}`)
  } else if (result.updated) {
    console.log(`[UPDATE] Course: ${courseData.slug}`)
  }

  return result
}

function warnModuleTitleConflict(existing, incoming) {
  if (existing.title !== incoming.title) {
    console.warn(
      `[WARN] Module order ${incoming.order} title mismatch: DB "${existing.title}" vs import "${incoming.title}" — updating to import value.`,
    )
  }
}

async function findOrCreateModule(payload, courseId, moduleData, { dryRun }) {
  const existing = await findSingle(payload, 'modules', {
    and: [{ course: { equals: courseId } }, { order: { equals: moduleData.order } }],
  })

  if (existing) {
    warnModuleTitleConflict(existing, moduleData)
  }

  return syncCreateOrUpdate(
    payload,
    'modules',
    {
      and: [{ course: { equals: courseId } }, { order: { equals: moduleData.order } }],
    },
    {
      title: moduleData.title,
      course: courseId,
      order: moduleData.order,
      isPublished: moduleData.isPublished !== false,
    },
    {
      title: moduleData.title,
      course: courseId,
      order: moduleData.order,
      isPublished: moduleData.isPublished !== false,
    },
    { dryRun },
  )
}

async function findOrCreateLesson(payload, courseId, moduleId, lessonData, { dryRun }) {
  const resolvedBlocks = await resolveTheoryBlockMediaRefs(payload, lessonData.theoryBlocks, {
    dryRun,
  })
  const theoryBlocks = toTheoryBlocks(resolvedBlocks)

  return syncCreateOrUpdate(
    payload,
    'lessons',
    {
      and: [
        { course: { equals: courseId } },
        { module: { equals: moduleId } },
        { order: { equals: lessonData.order } },
      ],
    },
    {
      title: lessonData.title,
      course: courseId,
      module: moduleId,
      order: lessonData.order,
      isPublished: lessonData.isPublished !== false,
      theoryBlocks,
    },
    {
      title: lessonData.title,
      course: courseId,
      module: moduleId,
      order: lessonData.order,
      isPublished: lessonData.isPublished !== false,
      theoryBlocks,
    },
    { dryRun },
  )
}

async function findOrCreateTask(payload, prisma, lessonId, taskData, tagsCache, { dryRun }) {
  const slugs = Array.isArray(taskData.tagSlugs) ? taskData.tagSlugs : []
  const tagKey = slugs.join('|')
  if (!tagsCache.has(tagKey)) {
    const taskTags = await getTaskTagObjectsBySlug(prisma, slugs)
    tagsCache.set(tagKey, taskTags)
  }

  const taskPayload = toTaskData(taskData, lessonId, tagsCache.get(tagKey))

  return syncCreateOrUpdate(
    payload,
    'tasks',
    {
      and: [
        { lesson: { contains: lessonId } },
        { order: { equals: taskData.order } },
        { type: { equals: taskData.type } },
      ],
    },
    taskPayload,
    taskPayload,
    { dryRun },
  )
}

function emptyStats() {
  return {
    modulesCreated: 0,
    modulesUpdated: 0,
    lessonsCreated: 0,
    lessonsUpdated: 0,
    tasksCreated: 0,
    tasksUpdated: 0,
  }
}

async function importModulesIntoCourse({ payload, prisma, course, modules, dryRun }) {
  const stats = emptyStats()
  const tagsCache = new Map()

  if (!course?.id) {
    throw new Error('importModulesIntoCourse: course.id is required')
  }

  for (const moduleData of modules) {
    const modResult = await findOrCreateModule(payload, course.id, moduleData, { dryRun })
    if (dryRun) {
      if (modResult.created) {
        console.log(
          `[DRY-RUN] [CREATE] Module ${moduleData.order}: ${moduleData.title} (${moduleData.lessons?.length || 0} lessons)`,
        )
      } else if (modResult.updated) {
        console.log(`[DRY-RUN] [UPDATE] Module ${moduleData.order}: ${moduleData.title}`)
      }
    } else {
      if (modResult.created) {
        stats.modulesCreated += 1
        console.log(`[CREATE] Module ${moduleData.order}: ${moduleData.title}`)
      } else if (modResult.updated) {
        stats.modulesUpdated += 1
        console.log(`[UPDATE] Module ${moduleData.order}: ${moduleData.title}`)
      }
    }

    const moduleDoc = modResult.doc
    if (!moduleDoc?.id) {
      continue
    }

    for (const lessonData of moduleData.lessons) {
      const lessonResult = await findOrCreateLesson(payload, course.id, moduleDoc.id, lessonData, {
        dryRun,
      })

      if (dryRun) {
        if (lessonResult.created) {
          console.log(
            `[DRY-RUN] [CREATE] Lesson ${moduleData.order}.${lessonData.order}: ${lessonData.title} (${lessonData.tasks?.length || 0} tasks)`,
          )
        } else if (lessonResult.updated) {
          console.log(`[DRY-RUN] [UPDATE] Lesson ${lessonData.order}: ${lessonData.title}`)
        }
      } else {
        if (lessonResult.created) {
          stats.lessonsCreated += 1
        } else if (lessonResult.updated) {
          stats.lessonsUpdated += 1
        }
      }

      const lessonDoc = lessonResult.doc
      if (!lessonDoc?.id) {
        continue
      }

      for (const taskData of lessonData.tasks) {
        const taskResult = await findOrCreateTask(
          payload,
          prisma,
          lessonDoc.id,
          taskData,
          tagsCache,
          { dryRun },
        )

        if (dryRun) {
          if (taskResult.created) {
            console.log(`[DRY-RUN] [CREATE] Task order ${taskData.order} type ${taskData.type}`)
          } else if (taskResult.updated) {
            console.log(`[DRY-RUN] [UPDATE] Task order ${taskData.order} type ${taskData.type}`)
          }
        } else {
          if (taskResult.created) {
            stats.tasksCreated += 1
          } else if (taskResult.updated) {
            stats.tasksUpdated += 1
          }
        }
      }

      if (!dryRun) {
        console.log(
          `[INFO] Lesson ${moduleData.order}.${lessonData.order} synced (${lessonData.tasks.length} tasks)`,
        )
      }
    }

    if (!dryRun) {
      console.log(`[INFO] Module ${moduleData.order} complete (${moduleData.lessons.length} lessons)`)
    }
  }

  return stats
}

async function appendModulesToExistingCourse({ payload, prisma, courseSlug, modules, dryRun }) {
  console.log(`[INFO] Appending modules to course slug=${courseSlug}`)

  const course = await findSingle(payload, 'courses', { slug: { equals: courseSlug } })
  if (!course) {
    throw new Error(`Course not found for slug: ${courseSlug}`)
  }

  console.log(`[INFO] Resolved course: ${course.title} (${course.slug}) id=${course.id}`)
  const stats = await importModulesIntoCourse({ payload, prisma, course, modules, dryRun })

  return {
    course,
    courseCreated: false,
    courseUpdated: false,
    ...stats,
  }
}

async function importCourseStructure({ payload, prisma, structure, dryRun, skipExistingCourses = false }) {
  console.log(`[INFO] Importing full course: ${structure.course?.slug || 'unknown'}`)

  const subject = await createOrGetSubject(payload, structure.subject, { dryRun })
  if (!subject?.id) {
    console.warn('[WARN] Subject missing id after import; skipping course tree (dry-run create?)')
    return {
      course: null,
      courseCreated: false,
      courseUpdated: false,
      ...emptyStats(),
    }
  }

  const courseOutcome = await findOrCreateCourse(payload, structure.course, subject.id, {
    dryRun,
    skipUpdateIfExists: skipExistingCourses,
  })
  const course = courseOutcome.doc

  if (!course?.id) {
    console.warn('[WARN] Course missing id; skipping modules (dry-run create?)')
    return {
      course: null,
      courseCreated: !!courseOutcome.created,
      courseUpdated: !!courseOutcome.updated,
      ...emptyStats(),
    }
  }

  const shouldSyncTree = !skipExistingCourses || courseOutcome.created
  let stats = emptyStats()
  if (shouldSyncTree) {
    stats = await importModulesIntoCourse({
      payload,
      prisma,
      course,
      modules: structure.modules,
      dryRun,
    })
  } else if (dryRun) {
    console.log(
      `[DRY-RUN] [SKIP] Would not sync modules/lessons/tasks for "${structure.course.slug}" (course already exists).`,
    )
  } else {
    console.log(
      `[SKIP] Not syncing modules/lessons/tasks for "${structure.course.slug}" (course already existed).`,
    )
  }

  return {
    course,
    courseCreated: !!courseOutcome.created,
    courseUpdated: !!courseOutcome.updated,
    ...stats,
  }
}

module.exports = {
  appendModulesToExistingCourse,
  importCourseStructure,
  importModulesIntoCourse,
  findSingle,
  ensureMediaFromImportAsset,
  IMPORT_PLACEHOLDER_IMAGE_TOKEN,
  PLACEHOLDER_MEDIA_FILENAME,
}
