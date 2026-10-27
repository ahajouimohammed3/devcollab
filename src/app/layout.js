import { LanguageProvider } from '@/context/LanguageContext'
import './globals.css'

export const metadata = {
  title: 'DevCollab - Project Management',
  description: 'Manage your workspaces and tasks efficiently',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}