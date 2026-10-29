'use client'

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'
import fr from '@/locales/fr.json'
import ar from '@/locales/ar.json'
import en from '@/locales/en.json'

const translations = { fr, ar, en }
const listeners = new Set()
let activeLocale = 'fr'
const LanguageContext = createContext()

const getLocale = () => activeLocale
const getServerLocale = () => 'fr'

const subscribeToLocale = (listener) => {
  listeners.add(listener)

  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('devcollab_lang')
    if (savedLang && savedLang in translations && savedLang !== activeLocale) {
      activeLocale = savedLang
    }
  }

  return () => {
    listeners.delete(listener)
  }
}

export function LanguageProvider({ children }) {
  const locale = useSyncExternalStore(subscribeToLocale, getLocale, getServerLocale)

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  const changeLanguage = (lang) => {
    if (!(lang in translations) || lang === activeLocale) return

    activeLocale = lang
    localStorage.setItem('devcollab_lang', lang)
    listeners.forEach((listener) => listener())
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[locale]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export const useTranslation = () => useContext(LanguageContext)