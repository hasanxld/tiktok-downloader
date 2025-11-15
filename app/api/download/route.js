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

    console.log('Processing TikTok URL with SSSTik:', url)
    
    // ✅ Use SSSTik.io API - Best for no watermark
    const videoData = await trySSSTikAPI(url)
    
    if (!videoData || !videoData.video.url_no_watermark) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'NO_WATERMARK_UNAVAILABLE', 
          message: 'Clean version not available for this video' 
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

// ✅ SSSTik.io API - Best for no watermark videos
async function trySSSTikAPI(url) {
  const apiUrl = 'https://ssstik.io/abc'
  
  console.log('Calling SSSTik API...')
  
  // SSSTik requires POST with form data
  const formData = new URLSearchParams()
  formData.append('id', url)
  formData.append('locale', 'en')
  formData.append('tt', 'your_tt_token_here') // This might need to be dynamic

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Origin': 'https://ssstik.io',
      'Referer': 'https://ssstik.io/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin'
    },
    body: formData.toString()
  })

  if (!response.ok) {
    throw new Error(`SSSTik API returned ${response.status}`)
  }

  const html = await response.text()
  
  // Extract video information from HTML response
  const videoData = extractVideoDataFromHTML(html)
  
  if (!videoData.videoUrl) {
    throw new Error('No video URL found in response')
  }

  return videoData
}

// ✅ Extract video data from SSSTik HTML response
function extractVideoDataFromHTML(html) {
  // Extract video URL (usually direct MP4 without watermark)
  const videoUrlMatch = html.match(/<a[^>]*href="([^"]*\.mp4[^"]*)"[^>]*download/)
  const videoUrl = videoUrlMatch ? videoUrlMatch[1] : null

  // Extract title
  const titleMatch = html.match(/<p[^>]*class="[^"]*maintext[^"]*"[^>]*>([^<]*)<\/p>/)
  const title = titleMatch ? titleMatch[1].trim() : 'TikTok Video'

  // Extract author
  const authorMatch = html.match(/<p[^>]*class="[^"]*subtext[^"]*"[^>]*>([^<]*)<\/p>/)
  const author = authorMatch ? authorMatch[1].trim() : 'TikTok User'

  // Extract duration (if available)
  const durationMatch = html.match(/(\d+)\s*seconds/)
  const duration = durationMatch ? parseInt(durationMatch[1]) : 0

  console.log('Extracted from SSSTik:', {
    videoUrl,
    title,
    author,
    duration
  })

  return {
    id: generateId(),
    title: title,
    author: {
      username: author.toLowerCase().replace(/\s+/g, ''),
      nickname: author,
      avatar: '',
    },
    video: {
      url: videoUrl,
      url_no_watermark: videoUrl, // SSSTik provides no watermark by default
      cover: '',
      duration: duration,
    },
    music: {
      title: 'Original Sound',
      author: 'Unknown Artist',
    },
    stats: {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
    },
  }
}

// ✅ Alternative method if SSSTik main API fails
async function trySSSTikAlternative(url) {
  // Alternative endpoint that might work better
  const alternativeUrl = `https://ssstik.io/api?url=${encodeURIComponent(url)}`
  
  console.log('Trying SSSTik alternative endpoint...')
  
  const response = await fetch(alternativeUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Referer': 'https://ssstik.io/'
    }
  })

  if (response.ok) {
    const data = await response.json()
    
    if (data.video_url) {
      return {
        id: generateId(),
        title: data.title || 'TikTok Video',
        author: {
          username: data.author?.username || 'unknown',
          nickname: data.author?.nickname || 'TikTok User',
          avatar: data.author?.avatar || '',
        },
        video: {
          url: data.video_url,
          url_no_watermark: data.video_url,
          cover: data.cover || '',
          duration: data.duration || 0,
        },
        music: {
          title: data.music?.title || 'Original Sound',
          author: data.music?.author || 'Unknown Artist',
        },
        stats: {
          likes: data.stats?.likes || 0,
          comments: data.stats?.comments || 0,
          shares: data.stats?.shares || 0,
          views: data.stats?.views || 0,
        },
      }
    }
  }
  
  throw new Error('Alternative endpoint failed')
}

// ✅ Generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
