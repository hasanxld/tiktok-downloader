import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')
    const filename = searchParams.get('filename') || 'tiktok-video.mp4'

    if (!videoUrl) {
      return new NextResponse('URL parameter is required', { status: 400 })
    }

    console.log('Proxy downloading from:', videoUrl)

    // Fetch the video with proper headers
    const videoResponse = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'video/mp4,video/webm,video/*;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Range': 'bytes=0-',
        'Referer': 'https://www.tiktok.com/',
        'Sec-Fetch-Dest': 'video',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    })

    if (!videoResponse.ok) {
      throw new Error(`Video fetch failed: ${videoResponse.status} ${videoResponse.statusText}`)
    }

    // Get video content
    const videoBuffer = await videoResponse.arrayBuffer()
    
    // Get content type from response or default to mp4
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4'
    const contentLength = videoResponse.headers.get('content-length') || videoBuffer.byteLength

    console.log('Video downloaded successfully:', {
      size: contentLength,
      type: contentType
    })

    // Create response with video data
    const response = new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': contentLength,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })

    return response

  } catch (error) {
    console.error('Proxy download error:', error)
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'DOWNLOAD_FAILED',
        message: 'Failed to download video via proxy'
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
