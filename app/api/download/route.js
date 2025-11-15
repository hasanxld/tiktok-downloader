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

    console.log('🔄 Processing TikTok URL via Proxy:', url)
    
    // ✅ Try multiple proxy methods
    let videoData = null
    let lastError = null

    const proxyMethods = [
      proxyViaSnapTik,
      proxyViaSSSTik,
      proxyViaMusicalDown,
      proxyViaTikDown
    ]

    for (const method of proxyMethods) {
      try {
        console.log(`🔄 Trying proxy method: ${method.name}`)
        videoData = await method(url)
        if (videoData && videoData.video.url_no_watermark) {
          console.log(`✅ SUCCESS with ${method.name}`)
          break
        }
      } catch (error) {
        lastError = error.message
        console.log(`❌ ${method.name} failed:`, error.message)
      }
    }

    if (!videoData || !videoData.video.url_no_watermark) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ALL_PROXIES_FAILED', 
          message: 'All download methods failed. Please try again later.' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: videoData
    })

  } catch (error) {
    console.error('Proxy download error:', error)
    
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

// ✅ PROXY 1: SnapTik Website Scraper
async function proxyViaSnapTik(tiktokUrl) {
  console.log('🔍 Scraping SnapTik website...')
  
  const snapTikUrl = 'https://snaptik.app/'
  
  // First, get the main page to get cookies
  const mainPageResponse = await fetch(snapTikUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Referer': 'https://www.google.com/'
    }
  })

  const mainPageHtml = await mainPageResponse.text()
  
  // Extract token from the page
  const tokenMatch = mainPageHtml.match(/name="token"\s+value="([^"]*)"/)
  const token = tokenMatch ? tokenMatch[1] : null
  
  console.log('📋 SnapTik Token:', token)

  if (!token) {
    throw new Error('Could not extract token from SnapTik')
  }

  // Now submit the TikTok URL
  const formData = new URLSearchParams()
  formData.append('url', tiktokUrl)
  formData.append('token', token)
  formData.append('submit', '')

  const submitResponse = await fetch(snapTikUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://snaptik.app',
      'Referer': 'https://snaptik.app/',
      'Cache-Control': 'no-cache',
      'Cookie': mainPageResponse.headers.get('set-cookie') || ''
    },
    body: formData.toString(),
    redirect: 'follow'
  })

  const resultHtml = await submitResponse.text()
  
  // Extract download links
  const downloadLinks = extractDownloadLinksFromSnapTik(resultHtml)
  
  if (downloadLinks.videoUrl) {
    return {
      id: generateId(),
      title: downloadLinks.title || 'TikTok Video',
      author: {
        username: 'tiktokuser',
        nickname: downloadLinks.author || 'TikTok User',
        avatar: '',
      },
      video: {
        url: downloadLinks.videoUrl,
        url_no_watermark: downloadLinks.videoUrl,
        cover: downloadLinks.cover || '',
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

  throw new Error('No video found in SnapTik response')
}

function extractDownloadLinksFromSnapTik(html) {
  // Extract video URL
  const videoUrlMatch = html.match(/<a[^>]*href="(https:\/\/[^"]*\.mp4[^"]*)"[^>]*download[^>]*>/i)
  const videoUrl = videoUrlMatch ? videoUrlMatch[1] : null

  // Extract title
  const titleMatch = html.match(/<h1[^>]*>([^<]*)<\/h1>/)
  const title = titleMatch ? titleMatch[1].trim() : 'TikTok Video'

  // Extract author
  const authorMatch = html.match(/<div[^>]*class="[^"]*author[^"]*"[^>]*>([^<]*)<\/div>/)
  const author = authorMatch ? authorMatch[1].trim() : 'TikTok User'

  console.log('📹 SnapTik Extracted:', { videoUrl, title, author })

  return { videoUrl, title, author }
}

// ✅ PROXY 2: SSSTik Website Scraper
async function proxyViaSSSTik(tiktokUrl) {
  console.log('🔍 Scraping SSSTik website...')
  
  const ssstikUrl = 'https://ssstik.io/'
  
  // Get main page first
  const mainPageResponse = await fetch(ssstikUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  })

  const mainPageHtml = await mainPageResponse.text()
  
  // Extract necessary tokens/parameters
  const tokenMatch = mainPageHtml.match(/name="tt"\s+value="([^"]*)"/)
  const token = tokenMatch ? tokenMatch[1] : 'default_token'

  // Submit the URL
  const formData = new URLSearchParams()
  formData.append('id', tiktokUrl)
  formData.append('locale', 'en')
  formData.append('tt', token)

  const submitResponse = await fetch(ssstikUrl + 'abc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Origin': 'https://ssstik.io',
      'Referer': 'https://ssstik.io/',
      'Cookie': mainPageResponse.headers.get('set-cookie') || ''
    },
    body: formData.toString()
  })

  const resultHtml = await submitResponse.text()
  
  const downloadLinks = extractDownloadLinksFromSSSTik(resultHtml)
  
  if (downloadLinks.videoUrl) {
    return {
      id: generateId(),
      title: downloadLinks.title || 'TikTok Video',
      author: {
        username: 'tiktokuser',
        nickname: downloadLinks.author || 'TikTok User',
        avatar: '',
      },
      video: {
        url: downloadLinks.videoUrl,
        url_no_watermark: downloadLinks.videoUrl,
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

  throw new Error('No video found in SSSTik response')
}

function extractDownloadLinksFromSSSTik(html) {
  // Extract video URL
  const videoUrlMatch = html.match(/<a[^>]*href="(https:\/\/[^"]*\.mp4[^"]*)"[^>]*download[^>]*>/i)
  const videoUrl = videoUrlMatch ? videoUrlMatch[1] : null

  // Extract title
  const titleMatch = html.match(/<p[^>]*class="[^"]*maintext[^"]*"[^>]*>([^<]*)<\/p>/)
  const title = titleMatch ? titleMatch[1].trim() : 'TikTok Video'

  console.log('📹 SSSTik Extracted:', { videoUrl, title })

  return { videoUrl, title }
}

// ✅ PROXY 3: Direct TikTok API (Fallback)
async function proxyViaTikDown(tiktokUrl) {
  console.log('🔍 Using TikDown as fallback...')
  
  // Use our previous reliable method as fallback
  const apiUrl = 'https://tikdown.org/api'
  
  const formData = new URLSearchParams()
  formData.append('url', tiktokUrl)

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Origin': 'https://tikdown.org',
      'Referer': 'https://tikdown.org/'
    },
    body: formData.toString()
  })

  if (response.ok) {
    const data = await response.json()
    
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
          url_no_watermark: data.data.play,
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

  throw new Error('TikDown fallback failed')
}

// ✅ PROXY 4: MusicalDown Scraper
async function proxyViaMusicalDown(tiktokUrl) {
  console.log('🔍 Scraping MusicalDown website...')
  
  const musicalDownUrl = 'https://musicaldown.com/'
  
  // Get main page
  const mainPageResponse = await fetch(musicalDownUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
    }
  })

  const mainPageHtml = await mainPageResponse.text()
  
  // Submit URL
  const formData = new URLSearchParams()
  formData.append('url', tiktokUrl)
  formData.append('submit', '')

  const submitResponse = await fetch(musicalDownUrl + 'download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Origin': 'https://musicaldown.com',
      'Referer': 'https://musicaldown.com/',
      'Cookie': mainPageResponse.headers.get('set-cookie') || ''
    },
    body: formData.toString()
  })

  const resultHtml = await submitResponse.text()
  
  // Extract video URL
  const videoUrlMatch = resultHtml.match(/<a[^>]*href="(https:\/\/[^"]*\.mp4[^"]*)"[^>]*download/i)
  const videoUrl = videoUrlMatch ? videoUrlMatch[1] : null

  if (videoUrl) {
    return {
      id: generateId(),
      title: 'TikTok Video',
      author: {
        username: 'tiktokuser',
        nickname: 'TikTok User',
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

  throw new Error('No video found in MusicalDown response')
}

// ✅ Generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
