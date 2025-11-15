// app/layout.js
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk'
})

export const metadata = {
  title: 'TikTok Downloader - Download TikTok Videos Without Watermark',
  description: 'Premium TikTok video downloader. Download HD TikTok videos without watermark for free.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
