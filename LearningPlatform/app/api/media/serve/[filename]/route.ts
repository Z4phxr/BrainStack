import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { isS3Configured, getSignedMediaUrl } from '@/lib/s3'

const PUBLIC_MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

const mimeForExt = (ext: string) => {
  switch (ext.toLowerCase()) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.gif': return 'image/gif'
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

    // Prevent path traversal
    const name = decodeURIComponent(path.basename(raw))

    // --- Local disk path takes priority ---
    // Files uploaded before S3 was configured only exist on disk.
    // Always serve from disk if present, regardless of S3 config.
    const target = path.join(PUBLIC_MEDIA_DIR, name)
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

    // --- S3 path: file not on disk, try signed URL redirect ---
    if (isS3Configured()) {
      const signedUrl = await getSignedMediaUrl(name)
      if (signedUrl) {
        // 307 Temporary Redirect - client follows to signed URL
        // Short cache so the redirect itself isn't cached longer than the signed URL TTL
        return NextResponse.redirect(signedUrl, {
          status: 307,
          headers: {
            'Cache-Control': 'private, max-age=300', // 5 min - matches typical presigned URL usage
          },
        })
      }
      console.warn(`[serve] S3 configured but failed to get signed URL for: ${name}`)
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

    const name = decodeURIComponent(path.basename(raw))

    // For S3: just confirm the object exists by attempting to generate a signed URL
    if (isS3Configured()) {
      const signedUrl = await getSignedMediaUrl(name, 60)
      if (signedUrl) {
        return new NextResponse(null, {
          status: 200,
          headers: { 'Cache-Control': 'private, max-age=60' },
        })
      }
    }

    const target = path.join(PUBLIC_MEDIA_DIR, name)
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
