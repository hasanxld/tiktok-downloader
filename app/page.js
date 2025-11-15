// app/page.js
'use client'
import { useState, useEffect } from 'react'
import { 
  Download, 
  Loader2, 
  Video, 
  User, 
  Music, 
  Calendar,
  CheckCircle, 
  XCircle, 
  X,
  Home,
  Download as DownloadIcon,
  Star,
  Settings,
  BarChart3,
  User as UserIcon,
  Shield,
  HelpCircle
} from 'lucide-react'

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
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <CheckCircle className="w-5 h-5" />
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
          <X className="w-4 h-4" />
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

// Sidebar Component
function Sidebar() {
  const [activeItem, setActiveItem] = useState('DASHBOARD')

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'DASHBOARD' },
    { icon: <DownloadIcon className="w-5 h-5" />, label: 'DOWNLOADS' },
    { icon: <Star className="w-5 h-5" />, label: 'FAVORITES' },
    { icon: <Settings className="w-5 h-5" />, label: 'SETTINGS' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'ANALYTICS' },
    { icon: <UserIcon className="w-5 h-5" />, label: 'PROFILE' },
    { icon: <Shield className="w-5 h-5" />, label: 'PRIVACY' },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'SUPPORT' }
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
            {item.icon}
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
function Header() {
  return (
    <header className="border-b border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              TIKTOK DOWNLOADER
            </h1>
            <p className="text-gray-600 text-sm">DOWNLOAD TIKTOK VIDEOS WITHOUT WATERMARK</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#tool" className="text-gray-700 hover:text-purple-600 font-medium">TOOL</a>
          <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium">FEATURES</a>
          <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 font-medium">HOW IT WORKS</a>
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 font-medium border-0">
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
        addToast({
          type: 'error',
          title: 'DOWNLOAD FAILED',
          message: data.message || 'FAILED TO DOWNLOAD VIDEO',
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
      const link = document.createElement('a')
      link.href = result.video.url_no_watermark
      link.download = 'tiktok-video.mp4'
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

  return (
    <section id="tool" className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          TIKTOK VIDEO DOWNLOADER
        </h2>
        <p className="text-gray-600 text-lg">DOWNLOAD HIGH-QUALITY TIKTOK VIDEOS WITHOUT WATERMARK</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="PASTE TIKTOK VIDEO URL HERE..."
            className="flex-1 p-4 border border-gray-300 outline-none font-medium placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 font-bold text-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>DOWNLOAD</span>
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-bold">FETCHING VIDEO DATA...</span>
            </div>
          </div>
        )}

        {result && (
          <div className="border border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Preview */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Video className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-lg">VIDEO PREVIEW</h3>
                </div>
                <video
                  src={result.video.url_no_watermark}
                  controls
                  className="w-full border border-gray-200"
                />
                <button
                  onClick={handleDirectDownload}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 font-bold mt-4 border-0"
                >
                  📥 DOWNLOAD VIDEO NOW
                </button>
              </div>

              {/* Video Details */}
              <div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-bold">AUTHOR</p>
                      <p className="text-gray-700">{result.author.nickname}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold">DESCRIPTION</p>
                    <p className="text-gray-700">{result.title || 'No description'}</p>
                  </div>

                  {result.music?.title && (
                    <div className="flex items-center space-x-2">
                      <Music className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-bold">MUSIC</p>
                        <p className="text-gray-700">{result.music.title}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-bold">DURATION</p>
                      <p className="text-gray-700">{result.video.duration || 'N/A'} seconds</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="font-bold text-2xl text-purple-600">{result.stats.likes?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-gray-600">LIKES</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-2xl text-blue-600">{result.stats.views?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-gray-600">VIEWS</p>
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
      icon: <Download className="w-8 h-8" />,
      title: "NO WATERMARK",
      description: "DOWNLOAD TIKTOK VIDEOS WITHOUT ANY WATERMARK IN HIGH QUALITY"
    },
    {
      icon: <Loader2 className="w-8 h-8" />,
      title: "ULTRA FAST",
      description: "LIGHTNING FAST DOWNLOAD SPEEDS WITH PREMIUM SERVERS"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "SECURE & SAFE",
      description: "100% SECURE DOWNLOADS WITH NO DATA COLLECTION"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "MOBILE FRIENDLY",
      description: "WORKS PERFECTLY ON ALL DEVICES AND SCREEN SIZES"
    }
  ]

  return (
    <section id="features" className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          PREMIUM FEATURES
        </h2>
        <p className="text-gray-600">EXPERIENCE THE BEST TIKTOK DOWNLOADER WITH ADVANCED FEATURES</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="border border-gray-200 p-6 text-center group hover:border-purple-500 transition-all">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          HOW IT WORKS
        </h2>
        <p className="text-gray-600">4 SIMPLE STEPS TO DOWNLOAD TIKTOK VIDEOS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, index) => (
          <div key={index} className="relative border border-gray-200 p-6 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-12 h-12 flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto">
              {item.step}
            </div>
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
            
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              TIKTOK DOWNLOADER
            </h3>
            <p className="text-gray-400 text-sm">
              PREMIUM TIKTOK VIDEO DOWNLOADER WITHOUT WATERMARK. FAST, SECURE, AND FREE.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">QUICK LINKS</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#tool" className="hover:text-white transition">DOWNLOAD TOOL</a></li>
              <li><a href="#features" className="hover:text-white transition">FEATURES</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">HOW IT WORKS</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">LEGAL</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">PRIVACY POLICY</a></li>
              <li><a href="#" className="hover:text-white transition">TERMS OF SERVICE</a></li>
              <li><a href="#" className="hover:text-white transition">DMCA</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">SUPPORT</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">CONTACT US</a></li>
              <li><a href="#" className="hover:text-white transition">HELP CENTER</a></li>
              <li><a href="#" className="hover:text-white transition">STATUS</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 TIKTOK DOWNLOADER. ALL RIGHTS RESERVED. | PREMIUM VIDEO DOWNLOADING TOOL
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function Home() {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Date.now()
    setToasts(prev => [...prev, { ...toast, id }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration || 5000)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Header />
          <main className="p-6">
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
