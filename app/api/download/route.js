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
    const tiktokRegex = /https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|[\w-]+\.tiktok\.com)\/([\w-]+\/)?([\w-]+\/)?([\w.?=&]+)?/
    
    if (!tiktokRegex.test(url)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_URL', 
          message: 'Please provide a valid TikTok URL. Supported formats: tiktok.com, vm.tiktok.com, vt.tiktok.com' 
        },
        { status: 400 }
      )
    }

    // ✅ Multiple API endpoints try korbe
    const apiEndpoints = [
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
      `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`
    ]

    let videoData = null
    let lastError = null

    // ✅ Try each API endpoint
    for (const apiUrl of apiEndpoints) {
      try {
        console.log(`Trying API: ${apiUrl}`)
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.tiktok.com/'
          },
          timeout: 10000
        })

        if (response.ok) {
          const data = await response.json()
          
          // ✅ Check different response formats
          if (data.code === 0 || data.success || data.data) {
            videoData = data
            console.log('Success with API:', apiUrl)
            break
          } else {
            lastError = data.msg || 'Invalid response format'
          }
        } else {
          lastError = `API returned ${response.status}`
        }
      } catch (error) {
        lastError = error.message
        console.log(`API failed: ${apiUrl}`, error.message)
        // Continue to next API
      }
    }

    if (!videoData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'DOWNLOAD_FAILED', 
          message: lastError || 'All download services failed. Please try again later.' 
        },
        { status: 500 }
      )
    }

    // ✅ Process successful response
    return NextResponse.json({
      success: true,
      data: processVideoData(videoData)
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

// ✅ Helper function to process different API response formats
function processVideoData(apiData) {
  // Format 1: tikwm.com format
  if (apiData.code === 0 && apiData.data) {
    return {
      id: apiData.data.id || Date.now().toString(),
      title: apiData.data.title || 'TikTok Video',
      author: {
        username: apiData.data.author?.unique_id || 'unknown',
        nickname: apiData.data.author?.nickname || 'Unknown User',
        avatar: apiData.data.author?.avatar || '',
      },
      video: {
        url: `https://www.tikwm.com${apiData.data.play}`,
        url_no_watermark: `https://www.tikwm.com${apiData.data.wmplay || apiData.data.play}`,
        cover: `https://www.tikwm.com${apiData.data.cover}`,
        duration: apiData.data.duration || 0,
      },
      music: {
        title: apiData.data.music_info?.title || 'Original Sound',
        author: apiData.data.music_info?.author || 'Unknown',
      },
      stats: {
        likes: apiData.data.digg_count || 0,
        comments: apiData.data.comment_count || 0,
        shares: apiData.data.share_count || 0,
        views: apiData.data.play_count || 0,
      },
    }
  }

  // Format 2: tiklydown format
  if (apiData.success && apiData.data) {
    return {
      id: apiData.data.id || Date.now().toString(),
      title: apiData.data.title || 'TikTok Video',
      author: {
        username: apiData.data.author?.id || 'unknown',
        nickname: apiData.data.author?.nickname || 'Unknown User',
        avatar: apiData.data.author?.avatar || '',
      },
      video: {
        url: apiData.data.play || '',
        url_no_watermark: apiData.data.wmplay || apiData.data.play || '',
        cover: apiData.data.cover || '',
        duration: apiData.data.duration || 0,
      },
      music: {
        title: apiData.data.music?.title || 'Original Sound',
        author: apiData.data.music?.author || 'Unknown',
      },
      stats: {
        likes: apiData.data.likes || 0,
        comments: apiData.data.comments || 0,
        shares: apiData.data.shares || 0,
        views: apiData.data.views || 0,
      },
    }
  }

  // ✅ Default format if none match
  return {
    id: Date.now().toString(),
    title: 'TikTok Video',
    author: {
      username: 'unknown',
      nickname: 'Unknown User',
      avatar: '',
    },
    video: {
      url: '',
      url_no_watermark: '',
      cover: '',
      duration: 0,
    },
    music: {
      title: 'Original Sound',
      author: 'Unknown',
    },
    stats: {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
    },
  }
      }
