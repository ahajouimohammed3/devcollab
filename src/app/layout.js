import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/context/LanguageContext'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata = {
  title: 'DevCollab - Project Management',
  description: 'A modern project management app supporting multiple languages',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body suppressHydrationWarning={true} className="bg-gray-50 text-gray-900 antialiased">
          <LanguageProvider>
            <Navbar />
            {children}
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}