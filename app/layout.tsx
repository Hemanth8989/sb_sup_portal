import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'StoneBridge — Supplier Portal',
  description: 'Manage your stone inventory and fabricator relationships',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="font-sans antialiased h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
