'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import fr from '@/locales/fr.json'
import ar from '@/locales/ar.json'
import en from '@/locales/en.json'

const translations = { fr, ar, en }

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  // الفرنسية هي الافتراضية
  const [locale, setLocale] = useState('fr')

  useEffect(() => {
    const savedLang = localStorage.getItem('devcollab_lang')
    if (savedLang && translations[savedLang]) {
      setLocale(savedLang)
    }
  }, [])

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLocale(lang)
      localStorage.setItem('devcollab_lang', lang)
    }
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