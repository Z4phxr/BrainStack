import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getPrivateMediaBody, isS3Configured, mediaExistsInS3 } from '@/lib/s3'

const PUBLIC_MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

/**
 * Decode the URL segment first, reject path separators, then take a single filename segment.
 * Avoids decode-after-basename tricks (e.g. %2F) escaping `public/media`.
 */
function safeMediaBasename(raw: string): string | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return null
  }
  if (decoded.includes('\0')) return null
  if (decoded.includes('/') || decoded.includes('\\')) return null
  const base = path.posix.basename(decoded.replace(/\\/g, '/'))
  if (!base || base === '.' || base === '..') return null
  if (base.includes('/') || base.includes('\\')) return null
  return base
}

/** Ensures `join(PUBLIC_MEDIA_DIR, name)` resolves under the media directory (Windows-safe). */
function resolvedMediaFilePath(name: string): string | null {
  const resolvedDir = path.resolve(PUBLIC_MEDIA_DIR)
  const joined = path.join(PUBLIC_MEDIA_DIR, name)
  const resolvedFile = path.resolve(joined)
  const prefix = resolvedDir.endsWith(path.sep) ? resolvedDir : `${resolvedDir}${path.sep}`
  const safe =
    process.platform === 'win32'
      ? resolvedFile.toLowerCase().startsWith(prefix.toLowerCase())
      : resolvedFile.startsWith(prefix)
  return safe ? joined : null
}

const mimeForExt = (ext: string) => {
  switch (ext.toLowerCase()) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.gif': return 'image/gif'
    case '.svg': return 'image/svg+xml'
    case '.mp4': return 'video/mp4'
    case '.webm': return 'video/webm'
    case '.pdf': return 'application/pdf'
    default: return 'application/octet-stream'
  }
}

export async function GET(request: Request, props: any) {
  try {
    const { filename: raw } = (await props.params) as { filename: string }
    if (!raw) return NextResponse.json({ error: 'Missing filename' }, { status: 400 })

    const name = safeMediaBasename(raw)
    if (!name) return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })

    // --- Local disk path takes priority ---
    // Files uploaded before S3 was configured only exist on disk.
    // Always serve from disk if present, regardless of S3 config.
    const target = resolvedMediaFilePath(name)
    if (!target) return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    if (fs.existsSync(target)) {
      const ext = path.extname(name)
      const mime = mimeForExt(ext)
      const buffer = fs.readFileSync(target)
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': buffer.length.toString(),
        },
      })
    }

    // --- S3 path: stream through this origin so `<img src="/api/media/serve/...">` works
    // under a strict CSP (browser img-src does not include every S3-compatible hostname).
    if (isS3Configured()) {
      const streamed = await getPrivateMediaBody(name)
      if (streamed) {
        const headers: Record<string, string> = {
          'Content-Type': streamed.contentType,
          'Cache-Control': 'private, max-age=300',
        }
        if (streamed.body instanceof Uint8Array) {
          const buf = Buffer.from(streamed.body)
          headers['Content-Length'] = String(buf.length)
          return new NextResponse(buf, { status: 200, headers })
        }
        return new NextResponse(streamed.body, { status: 200, headers })
      }
      console.warn(`[serve] S3 configured but object not readable: ${name}`)
    }

    // File not on disk and not in S3 (or S3 not configured)
    console.error(`[serve] Media file not found: ${name} (S3 configured: ${isS3Configured()})`)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  } catch (err) {
    console.error('Serve media error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// HEAD requests: check existence without body
export async function HEAD(request: Request, props: any) {
  try {
    const { filename: raw } = (await props.params) as { filename: string }
    if (!raw) return NextResponse.json({ error: 'Missing filename' }, { status: 400 })

    const name = safeMediaBasename(raw)
    if (!name) return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })

    if (isS3Configured()) {
      try {
        if (await mediaExistsInS3(name)) {
          return new NextResponse(null, {
            status: 200,
            headers: { 'Cache-Control': 'private, max-age=60' },
          })
        }
      } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
    }

    const target = resolvedMediaFilePath(name)
    if (!target) return NextResponse.json({ error: 'Invalid path' }, { status: 400 })

    if (!fs.existsSync(target)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const ext = path.extname(name)
    const mime = mimeForExt(ext)
    const stats = fs.statSync(target)

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': stats.size.toString(),
      },
    })
  } catch (err) {
    console.error('Serve media HEAD error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
