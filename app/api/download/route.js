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

    // ✅ Use multiple reliable APIs
    const apiEndpoints = [
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
      `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`,
      `https://tikdown.org/api?url=${encodeURIComponent(url)}`
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
          }
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
    const processedData = processVideoData(videoData)
    
    // ✅ Validate that we have at least one video URL
    if (!processedData.video.url && !processedData.video.url_no_watermark) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'NO_VIDEO_URL', 
          message: 'Could not extract video URL. The video might be private or unavailable.' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: processedData
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
  // Format 1: tikwm.com format (Most reliable)
  if (apiData.code === 0 && apiData.data) {
    const data = apiData.data
    return {
      id: data.id || Date.now().toString(),
      title: data.title || 'TikTok Video',
      author: {
        username: data.author?.unique_id || 'unknown',
        nickname: data.author?.nickname || 'Unknown User',
        avatar: data.author?.avatar || '',
      },
      video: {
        url: data.play ? `https://www.tikwm.com${data.play}` : '',
        url_no_watermark: data.wmplay ? `https://www.tikwm.com${data.wmplay}` : (data.play ? `https://www.tikwm.com${data.play}` : ''),
        cover: data.cover ? `https://www.tikwm.com${data.cover}` : '',
        duration: data.duration || 0,
      },
      music: {
        title: data.music_info?.title || 'Original Sound',
        author: data.music_info?.author || 'Unknown',
      },
      stats: {
        likes: data.digg_count || 0,
        comments: data.comment_count || 0,
        shares: data.share_count || 0,
        views: data.play_count || 0,
      },
    }
  }

  // Format 2: tiklydown format
  if (apiData.videos) {
    const videos = apiData.videos
    return {
      id: apiData.id || Date.now().toString(),
      title: apiData.title || 'TikTok Video',
      author: {
        username: apiData.author?.uniqueId || 'unknown',
        nickname: apiData.author?.nickname || 'Unknown User',
        avatar: apiData.author?.avatar || '',
      },
      video: {
        url: videos[0] || '',
        url_no_watermark: videos[1] || videos[0] || '',
        cover: apiData.covers?.[0] || '',
        duration: apiData.duration || 0,
      },
      music: {
        title: apiData.music?.title || 'Original Sound',
        author: apiData.music?.author || 'Unknown',
      },
      stats: {
        likes: apiData.stats?.diggCount || 0,
        comments: apiData.stats?.commentCount || 0,
        shares: apiData.stats?.shareCount || 0,
        views: apiData.stats?.playCount || 0,
      },
    }
  }

  // Format 3: Generic format
  if (apiData.data) {
    const data = apiData.data
    return {
      id: data.id || Date.now().toString(),
      title: data.title || data.desc || 'TikTok Video',
      author: {
        username: data.author?.id || data.author?.unique_id || 'unknown',
        nickname: data.author?.nickname || data.author?.name || 'Unknown User',
        avatar: data.author?.avatar || data.author?.avatar_url || '',
      },
      video: {
        url: data.play || data.video_url || data.url || '',
        url_no_watermark: data.wmplay || data.no_watermark || data.play || data.video_url || data.url || '',
        cover: data.cover || data.thumbnail || '',
        duration: data.duration || 0,
      },
      music: {
        title: data.music?.title || data.music_info?.title || 'Original Sound',
        author: data.music?.author || data.music_info?.author || 'Unknown',
      },
      stats: {
        likes: data.digg_count || data.like_count || data.likes || 0,
        comments: data.comment_count || data.comments || 0,
        shares: data.share_count || data.shares || 0,
        views: data.play_count || data.view_count || data.views || 0,
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
