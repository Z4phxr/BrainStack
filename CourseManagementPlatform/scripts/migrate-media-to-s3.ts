import fs from 'fs'
import path from 'path'
import { uploadBufferToS3 } from '../lib/s3'

async function migrate() {
  const mediaDir = path.join(process.cwd(), 'public', 'media')
  if (!fs.existsSync(mediaDir)) {
    console.error('No public/media directory found, nothing to migrate.')
    process.exit(1)
  }

  const files = fs.readdirSync(mediaDir)
  if (!files.length) {
    console.log('No files to migrate.')
    return
  }

  // Lazy import payload to avoid requiring DB unless we run this with DB envs
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  for (const file of files) {
    const filePath = path.join(mediaDir, file)
    const buffer = fs.readFileSync(filePath)
    try {
      const remoteUrl = await uploadBufferToS3(buffer, file, '')
      if (!remoteUrl) {
        console.warn(`Skipping ${file}: uploadBufferToS3 returned null`) 
        continue
      }

      // Update any Payload media records that reference this filename
      const results = await payload.find({ collection: 'media', where: { filename: { equals: file } } })
      for (const rec of results.docs) {
        await payload.update({ collection: 'media', id: rec.id, data: { url: remoteUrl } })
        console.log(`Updated record ${rec.id} -> ${remoteUrl}`)
      }

      console.log(`Migrated ${file} -> ${remoteUrl}`)
    } catch (err) {
      console.error(`Failed to migrate ${file}:`, err)
    }
  }
}

migrate().catch(err => { console.error(err); process.exit(1) })
