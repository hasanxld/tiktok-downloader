// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-0">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">TIKTOK DOWNLOADER</h3>
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
