import { DM_Mono, Space_Grotesk, Bebas_Neue } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono'
})

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue'
})

export const metadata = {
  title: 'SRU IPAL - Refinery Unit Cilacap',
  description: 'Sulfur Recovery Unit Operations Dashboard, Refinery Unit IV Cilacap',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmMono.variable} ${spaceGrotesk.variable} ${bebasNeue.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
