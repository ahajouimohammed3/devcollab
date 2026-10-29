import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/context/LanguageContext'
import AppShell from '@/components/AppShell'

export const metadata = {
  title: 'DevCollab',
  description: 'Plateforme collaborative de gestion de projets',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#4f46e5',
          colorText: '#0f172a',
          colorBackground: '#ffffff',
          borderRadius: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
      }}
    >
      <html lang="fr" suppressHydrationWarning>
        <body
          className="bg-slate-50 text-slate-900 antialiased font-sans"
          suppressHydrationWarning
        >
          <LanguageProvider>
            <AppShell>{children}</AppShell>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}