import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { uploadBufferToS3 } from '@/lib/s3'
import { requireAuth } from '@/lib/auth-helpers'

function hasValidImageMagicBytes(buf: Buffer): boolean {
  if (buf.length < 12) return false
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return true
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return true
  if (buf[0] === 0x42 && buf[1] === 0x4d) return true
  if (buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2a && buf[3] === 0x00) return true
  if (buf[0] === 0x4d && buf[1] === 0x4d && buf[2] === 0x00 && buf[3] === 0x2a) return true
  return false
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds maximum allowed size of 10 MB' }, { status: 413 })
    }

    const sanitize = (name: string) =>
      name
        .normalize('NFKD')
        .replace(/\s+/g, '-')
        .replace(/[^A-Za-z0-9._\-()]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

    const originalName = file.name || 'upload'
    const safeName = sanitize(originalName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (!hasValidImageMagicBytes(buffer)) {
      return NextResponse.json(
        { error: 'File content does not match a supported image format' },
        { status: 400 },
      )
    }

    const publicDir = path.join(process.cwd(), 'public', 'media')
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

    const s3BucketConfigured = Boolean(
      process.env.S3_BUCKET ||
        process.env.AWS_S3_BUCKET ||
        process.env.AWS_S3_BUCKET_NAME ||
        process.env.RAILWAY_BUCKET_NAME,
    )

    let finalName = safeName
    let remoteKey: string | null = null
    const ext = path.extname(safeName)
    const base = path.basename(safeName, ext)
    let attempt = 0
    while (fs.existsSync(path.join(publicDir, finalName))) {
      attempt += 1
      finalName = `${base}-${attempt}${ext}`
    }

    const localPath = path.join(publicDir, finalName)
    fs.writeFileSync(localPath, buffer)

    if (s3BucketConfigured) {
      try {
        remoteKey = await uploadBufferToS3(buffer, finalName, file.type)
      } catch {
        remoteKey = null
      }
    }

    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })

    const publicUrl = `/api/media/serve/${encodeURIComponent(finalName)}`
    const media = await payload.create({
      collection: 'media',
      data: {
        filename: finalName,
        mimeType: file.type,
        filesize: buffer.length,
        alt: originalName,
        url: publicUrl,
      },
      overrideAccess: true,
    })

    if (remoteKey) {
      try {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
      } catch {
        // best-effort cleanup
      }
    }

    return NextResponse.json({ success: true, url: publicUrl, id: media.id, filename: finalName })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[POST /api/creative-media/upload]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
