const { validateModuleFileExport } = require('./utils')
const { appendModulesToExistingCourse } = require('./course-import')

/**
 * Import one or more modules onto an existing course (by course slug).
 * Supports either `module` (single) or `modules` (array) in the data file.
 */
async function importModulePayload({ payload, prisma, data, dryRun, strict }) {
  validateModuleFileExport(data, { strict })

  const modules = []
  if (data.module) {
    modules.push(data.module)
  }
  if (Array.isArray(data.modules)) {
    modules.push(...data.modules)
  }

  if (modules.length === 0) {
    throw new Error('Module file must export `module` and/or a non-empty `modules` array')
  }

  const orders = modules.map((m) => m.order)
  const unique = new Set(orders)
  if (unique.size !== orders.length) {
    console.warn(`[WARN] Duplicate module orders in the same file for courseSlug=${data.courseSlug}`)
  }

  return appendModulesToExistingCourse({
    payload,
    prisma,
    courseSlug: data.courseSlug,
    modules,
    dryRun,
  })
}

module.exports = {
  importModulePayload,
}
