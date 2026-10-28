'use client'

import { useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { useTranslation } from '@/context/LanguageContext'
import Link from 'next/link'

export default function Navbar() {
  const { user } = useUser()
  const translationContext = useTranslation()
  const [showNotifications, setShowNotifications] = useState(false)

  // استخراج آمن لأي دالة محتملة لتغيير اللغة من السياق
  const locale = translationContext?.locale || 'ar'
  const changeLangFunc = 
    translationContext?.setLocale || 
    translationContext?.setLanguage || 
    translationContext?.changeLanguage ||
    ((lang) => {
      // محاولة تخزين اللغة محلياً إذا لم تكن الدالة موجودة في السياق
      localStorage.setItem('lang', lang)
      window.location.reload()
    })

  // إشعارات توضيحية للعرض
  const mockNotifications = [
    { id: 1, text: 'تم إسناد مهمة جديدة لك في مشروع DevCollab', time: 'منذ 5 دقائق', unread: true },
    { id: 2, text: 'أضاف أحد الأعضاء تعليقاً على مهمة التصميم', time: 'منذ ساعة', unread: false }
  ]

  const unreadCount = mockNotifications.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex justify-between items-center transition-all shadow-sm">
      
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300">
          D
        </div>
        <span className="font-black text-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent tracking-tight">
          DevCollab
        </span>
      </Link>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Language Selector */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 text-xs font-bold gap-1">
          <button
            onClick={() => changeLangFunc('ar')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              locale === 'ar' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => changeLangFunc('fr')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              locale === 'fr' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => changeLangFunc('en')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              locale === 'en' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 rounded-2xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/50 text-slate-600 transition-all relative shadow-xs"
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Popup Window */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-2xl border border-slate-100 rounded-3xl shadow-2xl p-4 z-50 animate-fadeIn">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  {locale === 'ar' ? 'الإشعارات' : locale === 'fr' ? 'Notifications' : 'Notifications'}
                </h4>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} {locale === 'ar' ? 'جديد' : 'New'}
                </span>
              </div>

              <div className="space-y-2">
                {mockNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      item.unread ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/50 border-slate-100'
                    }`}
                  >
                    <p className="text-slate-700 font-medium mb-1">{item.text}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info & Clerk Button */}
        <div className="flex items-center gap-4 pl-4 border-l border-slate-200/60">
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user.fullName || user.firstName || 'Dev Member'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          )}
          <div className="scale-105">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

      </div>
    </header>
  )
}