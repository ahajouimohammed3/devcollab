import { LanguageProvider } from '@/context/LanguageContext'
import './globals.css'

export const metadata = {
  title: 'DevCollab - Project Management',
  description: 'A modern project management app supporting multiple languages',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning={true}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}