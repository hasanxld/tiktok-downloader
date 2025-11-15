import { NextResponse } from 'next/server'

const rateLimitMap = new Map()

export async function POST(request) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowStart = now - 60000

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

    // ✅ ALL TikTok URL Patterns Support
    const tiktokRegex = /https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i
    if (!tiktokRegex.test(url)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_URL', 
          message: 'Please provide a valid TikTok URL' 
        },
        { status: 400 }
      )
    }

    // ✅ Use the most reliable TikTok API
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
    
    console.log('Fetching from:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.tiktok.com/'
      },
      timeout: 30000
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    
    console.log('API Response:', data)

    if (data.code === 0 && data.data) {
      const videoData = processTikWMData(data.data)
      return NextResponse.json({
        success: true,
        data: videoData
      })
    } else {
      throw new Error(data.msg || 'Failed to fetch video data')
    }

  } catch (error) {
    console.error('TikTok download error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'DOWNLOAD_FAILED', 
        message: 'Failed to download video. Please try again with a different URL.' 
      },
      { status: 500 }
    )
  }
}

// ✅ Process tikwm.com API response
function processTikWMData(data) {
  // Ensure we have proper video URLs
  const videoUrl = data.play ? ensureAbsoluteUrl(data.play) : ''
  const noWatermarkUrl = data.wmplay ? ensureAbsoluteUrl(data.wmplay) : videoUrl
  const coverUrl = data.cover ? ensureAbsoluteUrl(data.cover) : ''
  
  return {
    id: data.id || generateId(),
    title: data.title || 'TikTok Video',
    author: {
      username: data.author?.unique_id || 'unknown',
      nickname: data.author?.nickname || 'Unknown User',
      avatar: data.author?.avatar ? ensureAbsoluteUrl(data.author.avatar) : '',
    },
    video: {
      url: videoUrl,
      url_no_watermark: noWatermarkUrl,
      cover: coverUrl,
      duration: data.duration || 0,
    },
    music: {
      title: data.music_info?.title || 'Original Sound',
      author: data.music_info?.author || 'Unknown Artist',
    },
    stats: {
      likes: data.digg_count || 0,
      comments: data.comment_count || 0,
      shares: data.share_count || 0,
      views: data.play_count || 0,
    },
  }
}

// ✅ Ensure URLs are absolute
function ensureAbsoluteUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://www.tikwm.com${url}`
  return `https://www.tikwm.com/${url}`
}

// ✅ Generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
