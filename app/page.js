// app/page.js
'use client'
import { useState, useEffect } from 'react'

// Toast Component
function Toast({ type = 'info', title, message, duration = 5000, onClose }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(interval)
          onClose?.()
          return 0
        }
        return prev - (100 / (duration / 50))
      })
    }, 50)

    return () => clearInterval(interval)
  }, [duration, onClose])

  const toastIcons = {
    success: <i className="ri-checkbox-circle-fill text-white text-xl"></i>,
    error: <i className="ri-close-circle-fill text-white text-xl"></i>,
    info: <i className="ri-information-fill text-white text-xl"></i>
  }

  const toastColors = {
    success: 'bg-gradient-to-r from-green-500 to-blue-500 border-green-500',
    error: 'bg-gradient-to-r from-red-500 to-pink-500 border-red-500',
    info: 'bg-gradient-to-r from-purple-500 to-blue-500 border-purple-500'
  }

  return (
    <div className={`min-w-80 max-w-md text-white p-4 border-l-4 shadow-lg relative overflow-hidden ${toastColors[type]}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {toastIcons[type]}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-sm opacity-90 mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition"
        >
          <i className="ri-close-line text-white"></i>
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20">
        <div 
          className="h-full bg-white bg-opacity-50 transition-all duration-50"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Mobile Sidebar Component
function MobileSidebar({ isOpen, onClose }) {
  const [activeItem, setActiveItem] = useState('DASHBOARD')

  const menuItems = [
    { icon: 'ri-home-7-fill', label: 'DASHBOARD' },
    { icon: 'ri-download-cloud-2-fill', label: 'DOWNLOADS' },
    { icon: 'ri-star-fill', label: 'FAVORITES' },
    { icon: 'ri-settings-4-fill', label: 'SETTINGS' },
    { icon: 'ri-bar-chart-2-fill', label: 'ANALYTICS' },
    { icon: 'ri-user-3-fill', label: 'PROFILE' },
    { icon: 'ri-shield-keyhole-fill', label: 'PRIVACY' },
    { icon: 'ri-customer-service-2-fill', label: 'SUPPORT' }
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden
      `}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MENU
          </h2>
          <button onClick={onClose} className="lg:hidden">
            <i className="ri-close-line text-xl text-gray-600"></i>
          </button>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveItem(item.label)
                onClose()
              }}
              className={`w-full flex items-center space-x-3 p-3 mb-2 text-left border-0 transition-all ${
                activeItem === item.label 
                  ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 text-purple-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white text-center">
            <p className="font-bold text-sm">PREMIUM FEATURES</p>
            <p className="text-xs mt-1">UNLOCK ALL TOOLS</p>
            <button className="bg-white text-purple-600 px-4 py-2 text-sm font-bold mt-2 border-0">
              UPGRADE NOW
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Desktop Sidebar Component
function DesktopSidebar() {
  const [activeItem, setActiveItem] = useState('DASHBOARD')

  const menuItems = [
    { icon: 'ri-home-7-fill', label: 'DASHBOARD' },
    { icon: 'ri-download-cloud-2-fill', label: 'DOWNLOADS' },
    { icon: 'ri-star-fill', label: 'FAVORITES' },
    { icon: 'ri-settings-4-fill', label: 'SETTINGS' },
    { icon: 'ri-bar-chart-2-fill', label: 'ANALYTICS' },
    { icon: 'ri-user-3-fill', label: 'PROFILE' },
    { icon: 'ri-shield-keyhole-fill', label: 'PRIVACY' },
    { icon: 'ri-customer-service-2-fill', label: 'SUPPORT' }
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 hidden lg:block">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          NAVIGATION MENU
        </h2>
      </div>
      
      <nav className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(item.label)}
            className={`w-full flex items-center space-x-3 p-3 mb-2 text-left border-0 transition-all ${
              activeItem === item.label 
                ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 text-purple-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white text-center">
          <p className="font-bold text-sm">PREMIUM FEATURES</p>
          <p className="text-xs mt-1">UNLOCK ALL TOOLS</p>
          <button className="bg-white text-purple-600 px-4 py-2 text-sm font-bold mt-2 border-0">
            UPGRADE NOW
          </button>
        </div>
      </div>
    </aside>
  )
}

// Header Component
function Header({ onMenuToggle }) {
  return (
    <header className="border-b border-gray-200 bg-white p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuToggle}
            className="lg:hidden bg-gradient-to-r from-purple-500 to-blue-500 p-2 text-white"
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
          
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 hidden lg:block">
            <i className="ri-video-line text-white text-2xl"></i>
          </div>
          
          <div>
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              TIKTOK DOWNLOADER
            </h1>
            <p className="text-gray-600 text-xs lg:text-sm">DOWNLOAD TIKTOK VIDEOS WITHOUT WATERMARK</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <a href="#tool" className="text-gray-700 hover:text-purple-600 font-medium text-sm lg:text-base">TOOL</a>
          <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium text-sm lg:text-base">FEATURES</a>
          <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 font-medium text-sm lg:text-base">HOW IT WORKS</a>
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 lg:px-6 py-2 font-medium border-0 text-sm lg:text-base">
            GET STARTED
          </button>
        </nav>
      </div>
    </header>
  )
}

// Tool Section Component
function ToolSection({ addToast }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleDownload = async () => {
    if (!url.trim()) {
      addToast({
        type: 'error',
        title: 'INPUT ERROR',
        message: 'PLEASE ENTER A TIKTOK URL',
        duration: 3000
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        addToast({
          type: 'success',
          title: 'DOWNLOAD READY',
          message: 'VIDEO SUCCESSFULLY FETCHED',
          duration: 3000
        })
      } else {
        let errorMessage = data.message || 'FAILED TO DOWNLOAD VIDEO'
        
        if (data.error === 'INVALID_URL') {
          errorMessage = 'INVALID TIKTOK URL. SUPPORTED FORMATS: TIKTOK.COM, VM.TIKTOK.COM, VT.TIKTOK.COM'
        } else if (data.error === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = 'TOO MANY REQUESTS. PLEASE WAIT 1 MINUTE.'
        }
        
        addToast({
          type: 'error',
          title: 'DOWNLOAD FAILED',
          message: errorMessage,
          duration: 5000
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'NETWORK ERROR',
        message: 'PLEASE CHECK YOUR CONNECTION',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDirectDownload = () => {
    if (result?.video?.url_no_watermark) {
      // Create proxy download link
      const downloadUrl = `/api/proxy?url=${encodeURIComponent(result.video.url_no_watermark)}`
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `tiktok-${result.id || Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      addToast({
        type: 'success',
        title: 'DOWNLOAD STARTED',
        message: 'VIDEO DOWNLOAD IN PROGRESS',
        duration: 3000
      })
    }
  }

  // Truncate long titles
  const truncateTitle = (title, maxLength = 100) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + '...'
  }

  return (
    <section id="tool" className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          TIKTOK VIDEO DOWNLOADER
        </h2>
        <p className="text-gray-600 text-base lg:text-lg">DOWNLOAD HIGH-QUALITY TIKTOK VIDEOS WITHOUT WATERMARK</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-gray-200 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="PASTE TIKTOK VIDEO URL HERE... (tiktok.com, vm.tiktok.com, vt.tiktok.com)"
            className="flex-1 p-3 lg:p-4 border border-gray-300 outline-none font-medium placeholder-gray-400 text-sm lg:text-base"
            disabled={loading}
          />
          <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 lg:px-8 py-3 lg:py-4 font-bold text-base lg:text-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[140px] lg:min-w-[200px]"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin text-white text-lg lg:text-xl"></i>
                <span className="text-sm lg:text-base">PROCESSING...</span>
              </>
            ) : (
              <>
                <i className="ri-download-cloud-2-line text-white text-lg lg:text-xl"></i>
                <span className="text-sm lg:text-base">DOWNLOAD</span>
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 p-3 lg:p-4 text-white">
              <i className="ri-loader-4-line animate-spin text-white text-lg lg:text-xl"></i>
              <span className="font-bold text-sm lg:text-base">FETCHING VIDEO DATA...</span>
            </div>
          </div>
        )}

        {result && (
          <div className="border border-gray-200 p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Preview */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <i className="ri-video-line text-purple-600 text-lg lg:text-xl"></i>
                  <h3 className="font-bold text-base lg:text-lg">VIDEO PREVIEW</h3>
                </div>
                
                {result.video.url_no_watermark ? (
                  <div className="relative">
                    <video
                      src={result.video.url_no_watermark}
                      controls
                      className="w-full border border-gray-200 max-h-[400px]"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        document.getElementById('video-error').style.display = 'block'
                      }}
                    />
                    <div id="video-error" className="hidden bg-gray-100 border border-gray-200 w-full h-64 flex items-center justify-center">
                      <div className="text-center">
                        <i className="ri-error-warning-line text-4xl text-gray-400 mb-2"></i>
                        <p className="text-gray-600">Video preview not available</p>
                        <p className="text-sm text-gray-500">But you can still download the video</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 border border-gray-200 w-full h-64 flex items-center justify-center">
                    <div className="text-center">
                      <i className="ri-error-warning-line text-4xl text-gray-400 mb-2"></i>
                      <p className="text-gray-600">Video URL not available</p>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleDirectDownload}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 font-bold mt-4 border-0 flex items-center justify-center space-x-2 text-sm lg:text-base"
                >
                  <i className="ri-download-line text-white text-lg lg:text-xl"></i>
                  <span>DOWNLOAD VIDEO NOW</span>
                </button>
              </div>

              {/* Video Details */}
              <div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <i className="ri-user-3-line text-purple-600 text-lg lg:text-xl"></i>
                    <div>
                      <p className="font-bold text-sm lg:text-base">AUTHOR</p>
                      <p className="text-gray-700 text-sm lg:text-base">{result.author.nickname || 'Unknown'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-sm lg:text-base mb-2">DESCRIPTION</p>
                    <div className="bg-gray-50 border border-gray-200 p-3 max-h-32 overflow-y-auto">
                      <p className="text-gray-700 text-sm lg:text-base break-words">
                        {truncateTitle(result.title || 'No description available')}
                      </p>
                    </div>
                  </div>

                  {result.music?.title && (
                    <div className="flex items-center space-x-2">
                      <i className="ri-music-2-line text-purple-600 text-lg lg:text-xl"></i>
                      <div>
                        <p className="font-bold text-sm lg:text-base">MUSIC</p>
                        <p className="text-gray-700 text-sm lg:text-base">{result.music.title}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <i className="ri-time-line text-purple-600 text-lg lg:text-xl"></i>
                    <div>
                      <p className="font-bold text-sm lg:text-base">DURATION</p>
                      <p className="text-gray-700 text-sm lg:text-base">{result.video.duration || 'N/A'} seconds</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="font-bold text-xl lg:text-2xl text-purple-600">
                        {(result.stats.likes || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                        <i className="ri-heart-3-fill text-red-500"></i>
                        <span>LIKES</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xl lg:text-2xl text-blue-600">
                        {(result.stats.views || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                        <i className="ri-eye-fill text-blue-500"></i>
                        <span>VIEWS</span>
                      </p>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="font-bold text-lg text-green-600">
                        {(result.stats.comments || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                        <i className="ri-chat-3-fill text-green-500"></i>
                        <span>COMMENTS</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-orange-600">
                        {(result.stats.shares || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                        <i className="ri-share-forward-fill text-orange-500"></i>
                        <span>SHARES</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: 'ri-water-flash-fill',
      title: "NO WATERMARK",
      description: "DOWNLOAD TIKTOK VIDEOS WITHOUT ANY WATERMARK IN HIGH QUALITY"
    },
    {
      icon: 'ri-zap-fill',
      title: "ULTRA FAST",
      description: "LIGHTNING FAST DOWNLOAD SPEEDS WITH PREMIUM SERVERS"
    },
    {
      icon: 'ri-shield-check-fill',
      title: "SECURE & SAFE",
      description: "100% SECURE DOWNLOADS WITH NO DATA COLLECTION"
    },
    {
      icon: 'ri-smartphone-fill',
      title: "MOBILE FRIENDLY",
      description: "WORKS PERFECTLY ON ALL DEVICES AND SCREEN SIZES"
    }
  ]

  return (
    <section id="features" className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          PREMIUM FEATURES
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">EXPERIENCE THE BEST TIKTOK DOWNLOADER WITH ADVANCED FEATURES</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {features.map((feature, index) => (
          <div key={index} className="border border-gray-200 p-4 lg:p-6 text-center group hover:border-purple-500 transition-all">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 lg:mb-4 text-white group-hover:scale-110 transition-transform">
              <i className={`${feature.icon} text-xl lg:text-2xl`}></i>
            </div>
            <h3 className="font-bold text-base lg:text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// How It Works Component
function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "COPY TIKTOK URL",
      description: "COPY THE TIKTOK VIDEO URL FROM THE TIKTOK APP OR WEBSITE"
    },
    {
      step: "02",
      title: "PASTE URL",
      description: "PASTE THE COPIED URL INTO THE INPUT FIELD ABOVE"
    },
    {
      step: "03",
      title: "CLICK DOWNLOAD",
      description: "CLICK THE DOWNLOAD BUTTON TO PROCESS THE VIDEO"
    },
    {
      step: "04",
      title: "SAVE VIDEO",
      description: "DOWNLOAD YOUR TIKTOK VIDEO WITHOUT WATERMARK"
    }
  ]

  return (
    <section id="how-it-works" className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          HOW IT WORKS
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">4 SIMPLE STEPS TO DOWNLOAD TIKTOK VIDEOS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {steps.map((item, index) => (
          <div key={index} className="relative border border-gray-200 p-4 lg:p-6 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-white font-bold text-base lg:text-lg mb-3 lg:mb-4 mx-auto">
              {item.step}
            </div>
            <h3 className="font-bold text-base lg:text-lg mb-2">{item.title}</h3>
            <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">{item.description}</p>
            
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-6 h-1"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3 lg:mb-4">
              TIKTOK DOWNLOADER
            </h3>
            <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">
              PREMIUM TIKTOK VIDEO DOWNLOADER WITHOUT WATERMARK. FAST, SECURE, AND FREE.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-3 lg:mb-4 text-sm lg:text-base">QUICK LINKS</h4>
            <ul className="space-y-2 text-xs lg:text-sm text-gray-400">
              <li><a href="#tool" className="hover:text-white transition">DOWNLOAD TOOL</a></li>
              <li><a href="#features" className="hover:text-white transition">FEATURES</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">HOW IT WORKS</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-3 lg:mb-4 text-sm lg:text-base">LEGAL</h4>
            <ul className="space-y-2 text-xs lg:text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">PRIVACY POLICY</a></li>
              <li><a href="#" className="hover:text-white transition">TERMS OF SERVICE</a></li>
              <li><a href="#" className="hover:text-white transition">DMCA</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-3 lg:mb-4 text-sm lg:text-base">SUPPORT</h4>
            <ul className="space-y-2 text-xs lg:text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">CONTACT US</a></li>
              <li><a href="#" className="hover:text-white transition">HELP CENTER</a></li>
              <li><a href="#" className="hover:text-white transition">STATUS</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-6 lg:mt-8 pt-6 lg:pt-8 text-center">
          <p className="text-gray-400 text-xs lg:text-sm">
            © 2024 TIKTOK DOWNLOADER. ALL RIGHTS RESERVED. | PREMIUM VIDEO DOWNLOADING TOOL
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function TikTokDownloader() {
  const [toasts, setToasts] = useState([])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const addToast = (toast) => {
    const id = Date.now()
    setToasts(prev => [...prev, { ...toast, id }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration || 5000)
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <DesktopSidebar />
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Header onMenuToggle={() => setMobileSidebarOpen(true)} />
          <main className="p-4 lg:p-6">
            <ToolSection addToast={addToast} />
            <FeaturesSection />
            <HowItWorks />
          </main>
          <Footer />
        </div>
      </div>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            {...toast} 
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>
    </div>
  )
}
