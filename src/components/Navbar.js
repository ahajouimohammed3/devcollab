'use client'

import { UserButton, useAuth, SignInButton } from '@clerk/nextjs'
import { useTranslation } from '@/context/LanguageContext'
import Link from 'next/link'

export default function Navbar() {
  const { t, locale, changeLanguage } = useTranslation()
  const { isSignedIn } = useAuth()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link href="/workspaces" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              D
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              DevCollab
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link href="/workspaces" className="hover:text-blue-600 transition">
              {t('dashboard.workspaces')}
            </Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition">
              {t('dashboard.title')}
            </Link>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
            <button
              onClick={() => changeLanguage('fr')}
              className={`px-2.5 py-1 rounded-lg transition ${locale === 'fr' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-gray-900'}`}
            >
              FR
            </button>
            <button
              onClick={() => changeLanguage('ar')}
              className={`px-2.5 py-1 rounded-lg transition ${locale === 'ar' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-gray-900'}`}
            >
              عربي
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2.5 py-1 rounded-lg transition ${locale === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-gray-900'}`}
            >
              EN
            </button>
          </div>

          {/* User Auth Condition */}
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/sign-in" />
          ) : (
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-blue-500/10">
                {locale === 'ar' ? 'تسجيل الدخول' : locale === 'fr' ? 'Connexion' : 'Sign In'}
              </button>
            </SignInButton>
          )}
        </div>

      </div>
    </header>
  )
}