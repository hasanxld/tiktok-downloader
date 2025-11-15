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

    // ✅ Use multiple APIs to get no watermark video
    console.log('Processing TikTok URL:', url)
    
    let videoData = null
    let lastError = null

    // Try multiple APIs in sequence
    const apiAttempts = [
      tryTikWMAPI,
      tryTiklydownAPI,
      trySSSTikAPI
    ]

    for (const apiAttempt of apiAttempts) {
      try {
        videoData = await apiAttempt(url)
        if (videoData && videoData.video.url_no_watermark) {
          console.log('Success with API:', apiAttempt.name)
          break
        }
      } catch (error) {
        lastError = error.message
        console.log(`API ${apiAttempt.name} failed:`, error.message)
      }
    }

    if (!videoData || !videoData.video.url_no_watermark) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'DOWNLOAD_FAILED', 
          message: lastError || 'Failed to fetch video without watermark' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: videoData
    })

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

// ✅ API 1: tikwm.com (Most reliable for no watermark)
async function tryTikWMAPI(url) {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.tiktok.com/'
    }
  })

  if (!response.ok) throw new Error(`TikWM API returned ${response.status}`)

  const data = await response.json()
  
  if (data.code === 0 && data.data) {
    return processTikWMData(data.data)
  }
  
  throw new Error(data.msg || 'TikWM API failed')
}

// ✅ API 2: tiklydown (Alternative for no watermark)
async function tryTiklydownAPI(url) {
  const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    }
  })

  if (!response.ok) throw new Error(`Tiklydown API returned ${response.status}`)

  const data = await response.json()
  
  if (data.videos && data.videos.length > 0) {
    return processTiklydownData(data)
  }
  
  throw new Error('Tiklydown API failed')
}

// ✅ API 3: ssstik.io (Good for no watermark)
async function trySSSTikAPI(url) {
  const apiUrl = `https://ssstik.io/abc?url=${encodeURIComponent(url)}`
  
  // This API returns HTML, we need to parse it
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  if (!response.ok) throw new Error(`SSSTik API returned ${response.status}`)

  const html = await response.text()
  
  // Extract video URL from HTML (simplified)
  const videoUrlMatch = html.match(/https:\/\/[^"]*\.mp4[^"]*/)
  if (videoUrlMatch) {
    return {
      id: generateId(),
      title: 'TikTok Video',
      author: {
        username: 'unknown',
        nickname: 'TikTok User',
        avatar: ''
      },
      video: {
        url: videoUrlMatch[0],
        url_no_watermark: videoUrlMatch[0],
        cover: '',
        duration: 0
      },
      music: {
        title: 'Original Sound',
        author: 'Unknown'
      },
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0
      }
    }
  }
  
  throw new Error('SSSTik API failed to extract video')
}

// ✅ Process tikwm.com data
function processTikWMData(data) {
  // ALWAYS use no watermark URL for both preview and download
  const noWatermarkUrl = data.wmplay ? ensureAbsoluteUrl(data.wmplay) : 
                         data.play ? ensureAbsoluteUrl(data.play) : ''
  
  return {
    id: data.id || generateId(),
    title: data.title || 'TikTok Video',
    author: {
      username: data.author?.unique_id || 'unknown',
      nickname: data.author?.nickname || 'Unknown User',
      avatar: data.author?.avatar ? ensureAbsoluteUrl(data.author.avatar) : '',
    },
    video: {
      url: noWatermarkUrl, // Use no watermark for preview
      url_no_watermark: noWatermarkUrl, // Use no watermark for download
      cover: data.cover ? ensureAbsoluteUrl(data.cover) : '',
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

// ✅ Process tiklydown data
function processTiklydownData(data) {
  // Use the first video URL (usually no watermark)
  const videoUrl = data.videos[0] || ''
  
  return {
    id: data.id || generateId(),
    title: data.title || 'TikTok Video',
    author: {
      username: data.author?.uniqueId || 'unknown',
      nickname: data.author?.nickname || 'Unknown User',
      avatar: data.author?.avatar || '',
    },
    video: {
      url: videoUrl,
      url_no_watermark: videoUrl,
      cover: data.covers?.[0] || '',
      duration: data.duration || 0,
    },
    music: {
      title: data.music?.title || 'Original Sound',
      author: data.music?.author || 'Unknown',
    },
    stats: {
      likes: data.stats?.diggCount || 0,
      comments: data.stats?.commentCount || 0,
      shares: data.stats?.shareCount || 0,
      views: data.stats?.playCount || 0,
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
