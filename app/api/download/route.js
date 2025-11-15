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

    console.log('Processing TikTok URL for NO WATERMARK:', url)
    
    // ✅ Use ONLY no watermark APIs
    let videoData = null
    
    // Try multiple no watermark APIs in sequence
    const apiAttempts = [
      tryTiklydownNoWatermark,
      tryTikWMNoWatermark,
      trySSSTikNoWatermark
    ]

    for (const apiAttempt of apiAttempts) {
      try {
        videoData = await apiAttempt(url)
        if (videoData && videoData.video.url_no_watermark) {
          console.log('✅ SUCCESS with NO WATERMARK API:', apiAttempt.name)
          break
        }
      } catch (error) {
        console.log(`❌ API ${apiAttempt.name} failed:`, error.message)
        // Continue to next API
      }
    }

    if (!videoData || !videoData.video.url_no_watermark) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'NO_WATERMARK_NOT_AVAILABLE', 
          message: 'No watermark version not available for this video' 
        },
        { status: 404 }
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

// ✅ API 1: tiklydown (Best for no watermark)
async function tryTiklydownNoWatermark(url) {
  const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`
  
  console.log('Trying Tiklydown API...')
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    },
    timeout: 15000
  })

  if (!response.ok) throw new Error(`Tiklydown API returned ${response.status}`)

  const data = await response.json()
  
  if (data.videos && data.videos.length > 0) {
    // Use the first video (usually no watermark)
    const videoUrl = data.videos[0]
    
    return {
      id: data.id || generateId(),
      title: data.title || 'TikTok Video',
      author: {
        username: data.author?.uniqueId || 'unknown',
        nickname: data.author?.nickname || 'TikTok User',
        avatar: data.author?.avatar || '',
      },
      video: {
        url: videoUrl, // Preview with no watermark
        url_no_watermark: videoUrl, // Download with no watermark
        cover: data.covers?.[0] || '',
        duration: data.duration || 0,
      },
      music: {
        title: data.music?.title || 'Original Sound',
        author: data.music?.author || 'Unknown Artist',
      },
      stats: {
        likes: data.stats?.diggCount || 0,
        comments: data.stats?.commentCount || 0,
        shares: data.stats?.shareCount || 0,
        views: data.stats?.playCount || 0,
      },
    }
  }
  
  throw new Error('No video found in response')
}

// ✅ API 2: tikwm.com no watermark only
async function tryTikWMNoWatermark(url) {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
  
  console.log('Trying TikWM API for no watermark...')
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.tiktok.com/'
    },
    timeout: 15000
  })

  if (!response.ok) throw new Error(`TikWM API returned ${response.status}`)

  const data = await response.json()
  
  if (data.code === 0 && data.data) {
    const videoData = data.data
    
    // ✅ FORCE NO WATERMARK - Use wmplay if available, otherwise don't return
    if (!videoData.wmplay) {
      throw new Error('No watermark version not available')
    }
    
    const noWatermarkUrl = ensureAbsoluteUrl(videoData.wmplay)
    
    return {
      id: videoData.id || generateId(),
      title: videoData.title || 'TikTok Video',
      author: {
        username: videoData.author?.unique_id || 'unknown',
        nickname: videoData.author?.nickname || 'TikTok User',
        avatar: videoData.author?.avatar ? ensureAbsoluteUrl(videoData.author.avatar) : '',
      },
      video: {
        url: noWatermarkUrl, // Preview with no watermark
        url_no_watermark: noWatermarkUrl, // Download with no watermark
        cover: videoData.cover ? ensureAbsoluteUrl(videoData.cover) : '',
        duration: videoData.duration || 0,
      },
      music: {
        title: videoData.music_info?.title || 'Original Sound',
        author: videoData.music_info?.author || 'Unknown Artist',
      },
      stats: {
        likes: videoData.digg_count || 0,
        comments: videoData.comment_count || 0,
        shares: videoData.share_count || 0,
        views: videoData.play_count || 0,
      },
    }
  }
  
  throw new Error(data.msg || 'TikWM API failed')
}

// ✅ API 3: ssstik.io no watermark
async function trySSSTikNoWatermark(url) {
  const apiUrl = `https://ssstik.io/abc?url=${encodeURIComponent(url)}`
  
  console.log('Trying SSSTik API...')
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 15000
  })

  if (!response.ok) throw new Error(`SSSTik API returned ${response.status}`)

  const html = await response.text()
  
  // Extract no watermark video URL from HTML
  const videoUrlMatch = html.match(/https:\/\/[^"]*\.mp4[^"]*/)
  if (videoUrlMatch && !videoUrlMatch[0].includes('watermark')) {
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
  
  throw new Error('No watermark video not found')
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
