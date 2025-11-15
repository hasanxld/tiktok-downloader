// components/FeaturesSection.jsx
import { Download, Zap, Shield, Smartphone } from 'lucide-react'

const features = [
  {
    icon: <Download className="w-8 h-8" />,
    title: "NO WATERMARK",
    description: "DOWNLOAD TIKTOK VIDEOS WITHOUT ANY WATERMARK IN HIGH QUALITY"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "ULTRA FAST",
    description: "LIGHTNING FAST DOWNLOAD SPEEDS WITH PREMIUM SERVERS"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "SECURE & SAFE",
    description: "100% SECURE DOWNLOADS WITH NO DATA COLLECTION"
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "MOBILE FRIENDLY",
    description: "WORKS PERFECTLY ON ALL DEVICES AND SCREEN SIZES"
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold gradient-text mb-4">PREMIUM FEATURES</h2>
        <p className="text-gray-600">EXPERIENCE THE BEST TIKTOK DOWNLOADER WITH ADVANCED FEATURES</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="border border-gray-200 p-6 text-center group hover:border-purple-500 transition-all">
            <div className="bg-primary-gradient w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform">
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
