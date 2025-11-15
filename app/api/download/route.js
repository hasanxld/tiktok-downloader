import { NextResponse } from 'next/server'

const rateLimitMap = new Map()

// Advanced headers that mimic real browser
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"'
}

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

    console.log('🚀 Processing TikTok URL:', url)
    
    // ✅ Try ALL methods with advanced bypass
    let videoData = null
    const methods = [
      smartSnapTikProxy,
      smartSSSTikProxy, 
      smartTikMateProxy,
      smartMusicalDownProxy,
      directTikTokAPI
    ]

    for (const method of methods) {
      try {
        console.log(`🔄 Trying: ${method.name}`)
        videoData = await method(url)
        if (videoData && videoData.video?.url_no_watermark) {
          console.log(`✅ SUCCESS with ${method.name}`)
          break
        }
      } catch (error) {
        console.log(`❌ ${method.name} failed:`, error.message)
        // Continue to next method
      }
    }

    if (!videoData || !videoData.video?.url_no_watermark) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ALL_METHODS_FAILED', 
          message: 'All download methods failed. The video might be private or restricted.' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: videoData
    })

  } catch (error) {
    console.error('💥 Final error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'SERVER_ERROR', 
        message: 'Service temporarily unavailable. Please try again in a few minutes.' 
      },
      { status: 500 }
    )
  }
}

// 🔥 SMART PROXY 1: SnapTik with Advanced Bypass
async function smartSnapTikProxy(tiktokUrl) {
  console.log('🔍 Smart SnapTik Proxy...')
  
  const baseUrl = 'https://snaptik.app'
  let cookies = ''
  
  try {
    // Step 1: Get main page with proper browser simulation
    const mainResponse = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        ...BROWSER_HEADERS,
        'Referer': 'https://www.google.com/'
      },
      redirect: 'follow'
    })
    
    const mainHtml = await mainResponse.text()
    cookies = mainResponse.headers.get('set-cookie') || ''
    
    // Extract token with multiple patterns
    const tokenPatterns = [
      /name="token"\s+value="([^"]*)"/,
      /token["']?\s*[:=]\s*["']([^"']+)["']/,
      /<input[^>]*name="token"[^>]*value="([^"]*)"/
    ]
    
    let token = null
    for (const pattern of tokenPatterns) {
      const match = mainHtml.match(pattern)
      if (match) {
        token = match[1]
        break
      }
    }
    
    console.log('📋 Extracted Token:', token)
    
    if (!token) {
      // If no token found, try without it
      token = 'default'
    }

    // Step 2: Submit the URL with proper form data
    const formData = new URLSearchParams()
    formData.append('url', tiktokUrl)
    formData.append('token', token)
    formData.append('submit', '')
    formData.append('lang', 'en')

    const submitResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        ...BROWSER_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': baseUrl,
        'Referer': baseUrl + '/',
        'Cookie': cookies,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      body: formData.toString(),
      redirect: 'manual' // Handle redirects manually
    })

    let resultHtml = ''
    let resultCookies = cookies
    
    // Handle redirect
    if (submitResponse.status === 302 || submitResponse.status === 301) {
      const redirectUrl = submitResponse.headers.get('location')
      resultCookies = submitResponse.headers.get('set-cookie') || resultCookies
      
      if (redirectUrl) {
        const redirectResponse = await fetch(redirectUrl.startsWith('http') ? redirectUrl : baseUrl + redirectUrl, {
          headers: {
            ...BROWSER_HEADERS,
            'Cookie': resultCookies,
            'Referer': baseUrl + '/'
          }
        })
        resultHtml = await redirectResponse.text()
        resultCookies = redirectResponse.headers.get('set-cookie') || resultCookies
      }
    } else {
      resultHtml = await submitResponse.text()
      resultCookies = submitResponse.headers.get('set-cookie') || resultCookies
    }

    console.log('📄 Response length:', resultHtml.length)
    
    // Advanced video URL extraction with multiple patterns
    const videoPatterns = [
      /<a[^>]*href="(https?:\/\/[^"]*\.mp4[^"]*)"[^>]*download/i,
      /<a[^>]*download[^>]*href="(https?:\/\/[^"]*\.mp4[^"]*)"/i,
      /video-download[^>]*href="(https?:\/\/[^"]*\.mp4[^"]*)"/i,
      /download-link[^>]*href="(https?:\/\/[^"]*\.mp4[^"]*)"/i,
      /"url"\s*:\s*"([^"]*\.mp4[^"]*)"/i,
      /<source[^>]*src="(https?:\/\/[^"]*\.mp4[^"]*)"/i
    ]
    
    let videoUrl = null
    for (const pattern of videoPatterns) {
      const match = resultHtml.match(pattern)
      if (match) {
        videoUrl = match[1]
        console.log('🎯 Found video URL:', videoUrl)
        break
      }
    }

    if (videoUrl) {
      // Clean the URL
      videoUrl = videoUrl.replace(/\\\//g, '/').replace(/&amp;/g, '&')
      
      return {
        id: generateId(),
        title: 'TikTok Video',
        author: {
          username: 'tiktokuser',
          nickname: 'TikTok Creator',
          avatar: '',
        },
        video: {
          url: videoUrl,
          url_no_watermark: videoUrl,
          cover: '',
          duration: 0,
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
    
    throw new Error('No video URL found in response')
    
  } catch (error) {
    console.error('❌ SnapTik error:', error)
    throw error
  }
}

// 🔥 SMART PROXY 2: SSSTik with Advanced Bypass
async function smartSSSTikProxy(tiktokUrl) {
  console.log('🔍 Smart SSSTik Proxy...')
  
  const baseUrl = 'https://ssstik.io'
  
  try {
    // Get main page
    const mainResponse = await fetch(baseUrl, {
      headers: BROWSER_HEADERS
    })
    
    const mainHtml = await mainResponse.text()
    const cookies = mainResponse.headers.get('set-cookie') || ''
    
    // Extract token
    const tokenMatch = mainHtml.match(/name="tt"\s+value="([^"]*)"/)
    const token = tokenMatch ? tokenMatch[1] : '723b6a1a5f3d2e1c4a8b9c7d6e5f4a3b'
    
    console.log('📋 SSSTik Token:', token)

    // Submit request
    const formData = new URLSearchParams()
    formData.append('id', tiktokUrl)
    formData.append('locale', 'en')
    formData.append('tt', token)

    const submitResponse = await fetch(baseUrl + '/abc', {
      method: 'POST',
      headers: {
        ...BROWSER_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': baseUrl,
        'Referer': baseUrl + '/',
        'Cookie': cookies
      },
      body: formData.toString()
    })

    const resultHtml = await submitResponse.text()
    
    // Multiple extraction patterns for SSSTik
    const patterns = [
      /<a[^>]*href="(https?[^"]*\.mp4[^"]*)"[^>]*download/i,
      /download without watermark[^>]*href="(https?[^"]*\.mp4[^"]*)"/i,
      /"downloadLink":"([^"]*)"/i
    ]
    
    let videoUrl = null
    for (const pattern of patterns) {
      const match = resultHtml.match(pattern)
      if (match) {
        videoUrl = match[1].replace(/\\\//g, '/')
        console.log('🎯 SSSTik video URL:', videoUrl)
        break
      }
    }

    if (videoUrl) {
      return {
        id: generateId(),
        title: 'TikTok Video',
        author: {
          username: 'tiktokuser',
          nickname: 'TikTok Creator',
          avatar: '',
        },
        video: {
          url: videoUrl,
          url_no_watermark: videoUrl,
          cover: '',
          duration: 0,
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
    
    throw new Error('SSSTik: No video found')
    
  } catch (error) {
    console.error('❌ SSSTik error:', error)
    throw error
  }
}

// 🔥 SMART PROXY 3: TikMate (Alternative)
async function smartTikMateProxy(tiktokUrl) {
  console.log('🔍 Smart TikMate Proxy...')
  
  try {
    // Use a different approach - direct API call
    const apiUrl = `https://www.tikmate.app/api?url=${encodeURIComponent(tiktokUrl)}`
    
    const response = await fetch(apiUrl, {
      headers: {
        ...BROWSER_HEADERS,
        'Accept': 'application/json',
        'Referer': 'https://www.tikmate.app/'
      }
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.video_url) {
        return {
          id: generateId(),
          title: data.title || 'TikTok Video',
          author: {
            username: data.author?.username || 'tiktokuser',
            nickname: data.author?.nickname || 'TikTok Creator',
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
    
    throw new Error('TikMate API failed')
    
  } catch (error) {
    console.error('❌ TikMate error:', error)
    throw error
  }
}

// 🔥 SMART PROXY 4: MusicalDown Alternative
async function smartMusicalDownProxy(tiktokUrl) {
  console.log('🔍 Smart MusicalDown Proxy...')
  
  const baseUrl = 'https://musicaldown.com'
  
  try {
    const mainResponse = await fetch(baseUrl, {
      headers: BROWSER_HEADERS
    })
    
    const cookies = mainResponse.headers.get('set-cookie') || ''

    const formData = new URLSearchParams()
    formData.append('url', tiktokUrl)
    formData.append('submit', '')

    const submitResponse = await fetch(baseUrl + '/download', {
      method: 'POST',
      headers: {
        ...BROWSER_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': baseUrl,
        'Referer': baseUrl + '/',
        'Cookie': cookies
      },
      body: formData.toString()
    })

    const resultHtml = await submitResponse.text()
    
    const videoMatch = resultHtml.match(/<a[^>]*href="(https?[^"]*\.mp4[^"]*)"[^>]*download/i)
    const videoUrl = videoMatch ? videoMatch[1] : null

    if (videoUrl) {
      return {
        id: generateId(),
        title: 'TikTok Video',
        author: {
          username: 'tiktokuser',
          nickname: 'TikTok Creator',
          avatar: '',
        },
        video: {
          url: videoUrl,
          url_no_watermark: videoUrl,
          cover: '',
          duration: 0,
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
    
    throw new Error('MusicalDown: No video found')
    
  } catch (error) {
    console.error('❌ MusicalDown error:', error)
    throw error
  }
}

// 🔥 FINAL FALLBACK: Direct TikTok API Simulation
async function directTikTokAPI(tiktokUrl) {
  console.log('🔍 Direct TikTok API Simulation...')
  
  try {
    // Extract video ID from URL
    const videoIdMatch = tiktokUrl.match(/\/(\d+)(?:\?|$)/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null
    
    if (!videoId) {
      throw new Error('Could not extract video ID')
    }

    // Use a public TikTok API endpoint
    const apiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet',
        'Accept': 'application/json',
        'X-Khronos': Math.floor(Date.now() / 1000).toString(),
        'X-Gorgon': '04048044000000000000000000000000'
      }
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.aweme_list && data.aweme_list[0]) {
        const videoInfo = data.aweme_list[0]
        const videoUrl = videoInfo.video?.play_addr?.url_list?.[0]
        
        if (videoUrl) {
          return {
            id: videoInfo.aweme_id || generateId(),
            title: videoInfo.desc || 'TikTok Video',
            author: {
              username: videoInfo.author?.unique_id || 'tiktokuser',
              nickname: videoInfo.author?.nickname || 'TikTok Creator',
              avatar: videoInfo.author?.avatar_thumb?.url_list?.[0] || '',
            },
            video: {
              url: videoUrl,
              url_no_watermark: videoUrl,
              cover: videoInfo.video?.cover?.url_list?.[0] || '',
              duration: Math.floor(videoInfo.video?.duration / 1000) || 0,
            },
            music: {
              title: videoInfo.music?.title || 'Original Sound',
              author: videoInfo.music?.author || 'Unknown Artist',
            },
            stats: {
              likes: videoInfo.statistics?.digg_count || 0,
              comments: videoInfo.statistics?.comment_count || 0,
              shares: videoInfo.statistics?.share_count || 0,
              views: videoInfo.statistics?.play_count || 0,
            },
          }
        }
      }
    }
    
    throw new Error('Direct API failed')
    
  } catch (error) {
    console.error('❌ Direct API error:', error)
    throw error
  }
}

// ✅ Generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
