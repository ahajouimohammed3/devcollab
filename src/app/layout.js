import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/context/LanguageContext'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export const metadata = {
  title: 'DevCollab - Project Management',
  description: 'A modern project management app supporting multiple languages',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body suppressHydrationWarning={true} className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
          <LanguageProvider>
            <Navbar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}