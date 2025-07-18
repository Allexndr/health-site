import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DentalCloud - Система управления стоматологическими снимками',
  description: 'Централизованная система управления рентгеновскими снимками для стоматологических клиник',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
} 