// components/ToolSection.jsx
'use client'
import { useState } from 'react'
import { Download, Loader2, Video, User, Music, Calendar } from 'lucide-react'

export default function ToolSection({ addToast }) {
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
      window.open(result.video.url_no_watermark, '_blank')
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
        <h2 className="text-4xl font-bold gradient-text mb-4">TIKTOK VIDEO DOWNLOADER</h2>
        <p className="text-gray-600 text-lg">DOWNLOAD HIGH-QUALITY TIKTOK VIDEOS WITHOUT WATERMARK</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-gray-200 p-8">
        <div className="flex space-x-4 mb-6">
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
            className="bg-primary-gradient text-white px-8 py-4 font-bold text-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                  className="w-full bg-success-gradient text-white py-3 font-bold mt-4 border-0"
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
