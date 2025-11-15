// components/Sidebar.jsx
'use client'
import { useState } from 'react'

const menuItems = [
  { icon: '🏠', label: 'DASHBOARD' },
  { icon: '📥', label: 'DOWNLOADS' },
  { icon: '⭐', label: 'FAVORITES' },
  { icon: '⚙️', label: 'SETTINGS' },
  { icon: '📊', label: 'ANALYTICS' },
  { icon: '👤', label: 'PROFILE' },
  { icon: '🔒', label: 'PRIVACY' },
  { icon: '🆘', label: 'SUPPORT' }
]

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('DASHBOARD')

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold gradient-text">NAVIGATION MENU</h2>
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
            <span className="text-xl">{item.icon}</span>
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
