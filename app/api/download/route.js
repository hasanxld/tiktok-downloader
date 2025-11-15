import { NextResponse } from 'next/server'

const rateLimitMap = new Map()

export async function POST(request) {
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowStart = now - 60000

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

    const tiktokRegex = /https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/[^\s]+/
    if (!tiktokRegex.test(url)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_URL', message: 'Please provide a valid TikTok URL' },
        { status: 400 }
      )
    }

    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const data = await response.json()

    if (data.code === 0) {
      return NextResponse.json({
        success: true,
        data: {
          id: data.data.id,
          title: data.data.title,
          author: {
            username: data.data.author.unique_id,
            nickname: data.data.author.nickname,
            avatar: data.data.author.avatar,
          },
          video: {
            url: `https://www.tikwm.com${data.data.play}`,
            url_no_watermark: `https://www.tikwm.com${data.data.wmplay}`,
            cover: `https://www.tikwm.com${data.data.cover}`,
            duration: data.data.duration,
          },
          music: {
            title: data.data.music_info?.title || 'Original Sound',
            author: data.data.music_info?.author || 'Unknown',
          },
          stats: {
            likes: data.data.digg_count,
            comments: data.data.comment_count,
            shares: data.data.share_count,
            views: data.data.play_count,
          },
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'DOWNLOAD_FAILED', message: data.msg || 'Failed to download video' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('TikTok download error:', error)
    
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
