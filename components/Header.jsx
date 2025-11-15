// components/Header.jsx
export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-gradient p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">TIKTOK DOWNLOADER</h1>
            <p className="text-gray-600 text-sm">DOWNLOAD TIKTOK VIDEOS WITHOUT WATERMARK</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#tool" className="text-gray-700 hover:text-purple-600 font-medium">TOOL</a>
          <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium">FEATURES</a>
          <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 font-medium">HOW IT WORKS</a>
          <button className="bg-primary-gradient text-white px-6 py-2 font-medium border-0">
            GET STARTED
          </button>
        </nav>
      </div>
    </header>
  )
}
