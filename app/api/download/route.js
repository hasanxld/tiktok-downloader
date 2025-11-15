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

    console.log('Processing TikTok URL:', url)
    
    // ✅ Use TikDown API - Very reliable for no watermark
    const videoData = await tryTikDownAPI(url)
    
    if (!videoData || !videoData.video.url_no_watermark) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'DOWNLOAD_FAILED', 
          message: 'Failed to download video. Please try another URL.' 
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

// ✅ TikDown API - Very reliable for no watermark
async function tryTikDownAPI(url) {
  const apiUrl = 'https://tikdown.org/api'
  
  console.log('Calling TikDown API...')
  
  const formData = new URLSearchParams()
  formData.append('url', url)

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Origin': 'https://tikdown.org',
      'Referer': 'https://tikdown.org/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    },
    body: formData.toString()
  })

  if (!response.ok) {
    throw new Error(`TikDown API returned ${response.status}`)
  }

  const data = await response.json()
  
  console.log('TikDown Response:', data)

  if (data.success && data.data) {
    const videoInfo = data.data
    return {
      id: generateId(),
      title: videoInfo.title || 'TikTok Video',
      author: {
        username: videoInfo.author?.unique_id || 'unknown',
        nickname: videoInfo.author?.nickname || 'TikTok User',
        avatar: videoInfo.author?.avatar || '',
      },
      video: {
        url: videoInfo.play || '',
        url_no_watermark: videoInfo.play || '', // TikDown provides no watermark
        cover: videoInfo.cover || '',
        duration: videoInfo.duration || 0,
      },
      music: {
        title: videoInfo.music?.title || 'Original Sound',
        author: videoInfo.music?.author || 'Unknown Artist',
      },
      stats: {
        likes: videoInfo.like_count || 0,
        comments: videoInfo.comment_count || 0,
        shares: videoInfo.share_count || 0,
        views: videoInfo.play_count || 0,
      },
    }
  }
  
  throw new Error(data.message || 'TikDown API failed')
}

// ✅ Alternative: SnapTik API (Very reliable)
async function trySnapTikAPI(url) {
  const apiUrl = `https://snaptik.app/abc?url=${encodeURIComponent(url)}`
  
  console.log('Trying SnapTik API...')
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Referer': 'https://snaptik.app/'
    }
  })

  if (!response.ok) {
    throw new Error(`SnapTik API returned ${response.status}`)
  }

  const data = await response.json()
  
  if (data.data && data.data.video_url) {
    return {
      id: generateId(),
      title: data.data.title || 'TikTok Video',
      author: {
        username: data.data.author?.username || 'unknown',
        nickname: data.data.author?.nickname || 'TikTok User',
        avatar: data.data.author?.avatar || '',
      },
      video: {
        url: data.data.video_url,
        url_no_watermark: data.data.video_url, // SnapTik provides no watermark
        cover: data.data.cover || '',
        duration: data.data.duration || 0,
      },
      music: {
        title: data.data.music?.title || 'Original Sound',
        author: data.data.music?.author || 'Unknown Artist',
      },
      stats: {
        likes: data.data.stats?.likes || 0,
        comments: data.data.stats?.comments || 0,
        shares: data.data.stats?.shares || 0,
        views: data.data.stats?.views || 0,
      },
    }
  }
  
  throw new Error('SnapTik API failed')
}

// ✅ Alternative 2: TikTokDownloader API
async function tryTikTokDownloaderAPI(url) {
  const apiUrl = `https://www.tiktokdownloader.org/api?url=${encodeURIComponent(url)}`
  
  console.log('Trying TikTokDownloader API...')
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    }
  })

  if (response.ok) {
    const data = await response.json()
    
    if (data.video_url) {
      return {
        id: generateId(),
        title: data.title || 'TikTok Video',
        author: {
          username: data.author?.id || 'unknown',
          nickname: data.author?.name || 'TikTok User',
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
          author: data.music?.artist || 'Unknown Artist',
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
  
  throw new Error('TikTokDownloader API failed')
}

// ✅ Generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }
