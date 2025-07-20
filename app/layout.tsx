import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
<<<<<<< HEAD
import { AuthProvider } from '../lib/providers/AuthProvider'
=======
import { AuthProvider } from '@/lib/providers/AuthProvider'
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a

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
<<<<<<< HEAD
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
          <Toaster richColors position="top-right" />
=======
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <Toaster richColors position="top-right" />
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
        </AuthProvider>
      </body>
    </html>
  )
} 