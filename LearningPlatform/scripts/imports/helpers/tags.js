const { assertNonEmptyString, assertPlainObject } = require('./utils')

/**
 * Prisma Tag rows formatted for Payload Tasks nested `tags` field.
 */
async function getTaskTagObjectsBySlug(prisma, slugs) {
  const unique = [...new Set((slugs || []).map((s) => String(s).trim()).filter(Boolean))]
  if (unique.length === 0) {
    return []
  }

  const tags = await prisma.tag.findMany({
    where: { slug: { in: unique } },
  })

  return tags.map((t) => ({
    tagId: t.id,
    name: t.name,
    slug: t.slug,
  }))
}

async function getTagIdsBySlug(prisma, slugs) {
  const objs = await getTaskTagObjectsBySlug(prisma, slugs)
  return objs.map((o) => o.tagId)
}

function validateTagRow(tag, index) {
  try {
    assertPlainObject(tag, `tags[${index}]`)
    assertNonEmptyString(tag.name, `tags[${index}].name`)
    assertNonEmptyString(tag.slug, `tags[${index}].slug`)
  } catch (e) {
    e.message = `Invalid tag at index ${index}: ${e.message}`
    throw e
  }
}

/**
 * Idempotent tag upsert keyed by slug. Updates name/main when provided.
 * @returns {Promise<{ created: number, updated: number, skipped: number, errors: Array<{slug:string, error:string}> }>}
 */
async function importTagsFromList(prisma, tags, { dryRun }) {
  const out = { created: 0, updated: 0, skipped: 0, errors: [] }

  if (!Array.isArray(tags)) {
    throw new Error('Tags export must be an array')
  }

  for (let i = 0; i < tags.length; i += 1) {
    const tag = tags[i]
    try {
      validateTagRow(tag, i)
    } catch (err) {
      out.errors.push({ slug: tag?.slug || `#${i}`, error: err.message })
      continue
    }

    const main = typeof tag.main === 'boolean' ? tag.main : false

    try {
      const bySlug = await prisma.tag.findUnique({
        where: { slug: tag.slug },
      })

      if (bySlug) {
        const needsUpdate = bySlug.name !== tag.name || bySlug.main !== main
        if (!needsUpdate) {
          console.log(`[SKIP] Tag already exists: ${tag.slug}`)
          out.skipped += 1
          continue
        }

        if (dryRun) {
          console.log(`[DRY-RUN] [UPDATE] Tag: ${tag.slug}`)
          out.updated += 1
          continue
        }

        await prisma.tag.update({
          where: { id: bySlug.id },
          data: { name: tag.name, slug: tag.slug, main },
        })
        console.log(`[UPDATE] Tag: ${tag.name} (${tag.slug})`)
        out.updated += 1
        continue
      }

      // Slug is new, but `name` is @unique — reconcile row that only matches by name
      // (e.g. old data: same display name, different slug).
      const byName = await prisma.tag.findUnique({
        where: { name: tag.name },
      })

      if (byName) {
        const needsSlugOrMain = byName.slug !== tag.slug || byName.main !== main
        if (!needsSlugOrMain) {
          console.log(`[SKIP] Tag already exists by name: ${tag.name} (${tag.slug})`)
          out.skipped += 1
          continue
        }

        if (dryRun) {
          console.log(`[DRY-RUN] [UPDATE] Tag (by name): ${tag.slug}`)
          out.updated += 1
          continue
        }

        await prisma.tag.update({
          where: { id: byName.id },
          data: { name: tag.name, slug: tag.slug, main },
        })
        console.log(`[UPDATE] Tag reconciled by name → ${tag.name} (${tag.slug})`)
        out.updated += 1
        continue
      }

      if (dryRun) {
        console.log(`[DRY-RUN] [CREATE] Tag: ${tag.slug}`)
        out.created += 1
        continue
      }

      await prisma.tag.create({
        data: {
          name: tag.name,
          slug: tag.slug,
          main,
        },
      })
      console.log(`[CREATE] Tag: ${tag.name} (${tag.slug})`)
      out.created += 1
    } catch (err) {
      const code = err && err.code ? ` (${err.code})` : ''
      const msg = `${err.message || String(err)}${code}`
      out.errors.push({ slug: tag.slug, error: msg })
      console.error(`[ERROR] Tag ${tag.slug}: ${msg}`)
    }
  }

  return out
}

module.exports = {
  getTaskTagObjectsBySlug,
  getTagIdsBySlug,
  importTagsFromList,
}
