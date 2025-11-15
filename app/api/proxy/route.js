import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')

    if (!videoUrl) {
      return new NextResponse('URL parameter is required', { status: 400 })
    }

    // Fetch the video
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.tiktok.com/'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`)
    }

    // Get the video buffer
    const videoBuffer = await response.arrayBuffer()

    // Return the video with proper headers
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="tiktok-video.mp4"',
        'Content-Length': response.headers.get('content-length'),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new NextResponse('Failed to download video', { status: 500 })
  }
}
