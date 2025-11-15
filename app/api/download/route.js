// app/api/download/route.js
import { NextResponse } from 'next/server'
import { TikTokScraper } from 'tiktok-scraper-without-watermark'

const rateLimitMap = new Map()

export async function POST(request) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowStart = now - 60000 // 1 minute window

  // Rate limiting
  const requests = rateLimitMap.get(clientIP) || []
  const recentRequests = requests.filter(time => time > windowStart)
  
  if (recentRequests.length >= 100) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.' 
      },
      { status: 429 }
    )
  }

  recentRequests.push(now)
  rateLimitMap.set(clientIP, recentRequests)

  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'MISSING_URL', message: 'TikTok URL is required' },
        { status: 400 }
      )
    }

    // Validate TikTok URL
    const tiktokRegex = /https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/[^\s]+/
    if (!tiktokRegex.test(url)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_URL', message: 'Please provide a valid TikTok URL' },
        { status: 400 }
      )
    }

    const scraper = new TikTokScraper()
    const videoData = await scraper.getVideo(url)

    if (!videoData || !videoData.video_url_no_watermark) {
      return NextResponse.json(
        { success: false, error: 'DOWNLOAD_FAILED', message: 'Failed to fetch video data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: videoData.id,
        title: videoData.title || 'TikTok Video',
        description: videoData.description,
        author: {
          username: videoData.author?.nickname || 'Unknown',
          nickname: videoData.author?.nickname,
          avatar: videoData.author?.avatar,
        },
        video: {
          url: videoData.video_url,
          url_no_watermark: videoData.video_url_no_watermark,
          duration: videoData.duration,
          cover: videoData.cover,
        },
        music: {
          title: videoData.music?.title,
          author: videoData.music?.author,
          url: videoData.music?.url,
        },
        stats: {
          likes: videoData.like_count,
          comments: videoData.comment_count,
          shares: videoData.share_count,
          views: videoData.play_count,
        },
        created: videoData.create_time,
      }
    })

  } catch (error) {
    console.error('TikTok download error:', error)
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'VIDEO_NOT_FOUND', message: 'Video not found or private' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'SERVER_ERROR', 
        message: 'Failed to download video. Please try again.' 
      },
      { status: 500 }
    )
  }
}
