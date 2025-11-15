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

    console.log('🚀 Processing TikTok URL for NO WATERMARK:', url)
    
    // ✅ Use reliable no watermark API
    const videoData = await getNoWatermarkVideo(url)
    
    if (!videoData || !videoData.video.url_no_watermark) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'NO_WATERMARK_UNAVAILABLE', 
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
    console.error('Download error:', error)
    
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

// ✅ Get NO WATERMARK video from reliable source
async function getNoWatermarkVideo(tiktokUrl) {
  console.log('🔍 Finding no watermark version...')
  
  // Method 1: Use TikTokDownloadAPI (most reliable)
  try {
    const apiUrl = `https://www.tikdown.org/api`
    
    const formData = new URLSearchParams()
    formData.append('url', tiktokUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.tikdown.org',
        'Referer': 'https://www.tikdown.org/'
      },
      body: formData.toString()
    })

    if (response.ok) {
      const data = await response.json()
      console.log('TikDown Response:', data)
      
      if (data.success && data.data && data.data.play) {
        return {
          id: generateId(),
          title: data.data.title || 'TikTok Video',
          author: {
            username: data.data.author?.unique_id || 'unknown',
            nickname: data.data.author?.nickname || 'TikTok User',
            avatar: data.data.author?.avatar || '',
          },
          video: {
            url: data.data.play,
            url_no_watermark: data.data.play, // This should be no watermark
            cover: data.data.cover || '',
            duration: data.data.duration || 0,
          },
          music: {
            title: data.data.music?.title || 'Original Sound',
            author: data.data.music?.author || 'Unknown Artist',
          },
          stats: {
            likes: data.data.like_count || 0,
            comments: data.data.comment_count || 0,
            shares: data.data.share_count || 0,
            views: data.data.play_count || 0,
          },
        }
      }
    }
  } catch (error) {
    console.log('TikDown failed:', error.message)
  }

  // Method 2: Use TikTokDownload API (alternative)
  try {
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('TikWM Response:', data)
      
      if (data.code === 0 && data.data) {
        // Use wmplay for no watermark, fallback to play
        const videoUrl = data.data.wmplay || data.data.play
        
        if (videoUrl) {
          return {
            id: generateId(),
            title: data.data.title || 'TikTok Video',
            author: {
              username: data.data.author?.unique_id || 'unknown',
              nickname: data.data.author?.nickname || 'TikTok User',
              avatar: data.data.author?.avatar || '',
            },
            video: {
              url: `https://tikwm.com${videoUrl}`,
              url_no_watermark: `https://tikwm.com${videoUrl}`,
              cover: data.data.cover ? `https://tikwm.com${data.data.cover}` : '',
              duration: data.data.duration || 0,
            },
            music: {
              title: data.data.music_info?.title || 'Original Sound',
              author: data.data.music_info?.author || 'Unknown Artist',
            },
            stats: {
              likes: data.data.digg_count || 0,
              comments: data.data.comment_count || 0,
              shares: data.data.share_count || 0,
              views: data.data.play_count || 0,
            },
          }
        }
      }
    }
  } catch (error) {
    console.log('TikWM failed:', error.message)
  }

  // Method 3: Use SSSTik alternative
  try {
    const apiUrl = `https://ssstik.io/api?url=${encodeURIComponent(tiktokUrl)}`
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://ssstik.io/'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('SSSTik Response:', data)
      
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
  } catch (error) {
    console.log('SSSTik failed:', error.message)
  }

  throw new Error('All no watermark methods failed')
}

// ✅ Generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
