// components/Toast.jsx
'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const toastIcons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />
}

const toastColors = {
  success: 'bg-success-gradient border-green-500',
  error: 'bg-danger-gradient border-red-500',
  warning: 'bg-yellow-500 border-yellow-500',
  info: 'bg-blue-500 border-blue-500'
}

export default function Toast({ type = 'info', title, message, duration = 5000, onClose }) {
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
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20">
        <div 
          className="h-full bg-white bg-opacity-50 transition-all duration-50"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
