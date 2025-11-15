import { NextResponse } from 'next/server'

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'video/mp4,video/webm,video/*;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity', // Important: disable compression for streaming
  'Range': 'bytes=0-',
  'Referer': 'https://www.tiktok.com/',
  'Sec-Fetch-Dest': 'video',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'cross-site',
  'Connection': 'keep-alive'
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')
    const filename = searchParams.get('filename') || `tiktok-${Date.now()}.mp4`

    if (!videoUrl) {
      return new NextResponse('URL parameter is required', { status: 400 })
    }

    console.log('🚀 Proxy downloading:', videoUrl)

    // Fetch with advanced headers and timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const videoResponse = await fetch(videoUrl, {
        headers: BROWSER_HEADERS,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!videoResponse.ok) {
        throw new Error(`HTTP ${videoResponse.status}: ${videoResponse.statusText}`)
      }

      // Stream the response
      const videoBuffer = await videoResponse.arrayBuffer()
      const contentType = videoResponse.headers.get('content-type') || 'video/mp4'
      const contentLength = videoResponse.headers.get('content-length') || videoBuffer.byteLength

      console.log('✅ Download successful:', { 
        size: contentLength,
        type: contentType 
      })

      return new NextResponse(videoBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': contentLength,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }

  } catch (error) {
    console.error('💥 Proxy download error:', error)
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'DOWNLOAD_FAILED',
        message: error.message || 'Failed to download video'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  })
}
