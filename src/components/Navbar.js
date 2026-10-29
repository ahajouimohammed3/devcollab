'use client'

import { useState } from 'react'
import { Bell, ChevronDown, Languages, Sparkles } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useTranslation } from '@/context/LanguageContext'

const navbarText = {
  fr: {
    workspace: 'Espaces de travail',
    dashboard: 'Tableau de bord',
    notifications: 'Notifications',
    new: 'nouveau',
    account: 'Compte',
  },
  en: {
    workspace: 'Workspaces',
    dashboard: 'Dashboard',
    notifications: 'Notifications',
    new: 'new',
    account: 'Account',
  },
  ar: {
    workspace: 'مساحات العمل',
    dashboard: 'لوحة التحكم',
    notifications: 'الإشعارات',
    new: 'جديد',
    account: 'الحساب',
  },
}

const languages = [
  { value: 'fr', label: 'FR' },
  { value: 'en', label: 'EN' },
  { value: 'ar', label: 'عربي' },
]

export default function Navbar() {
  const { user } = useUser()
  const { locale, changeLanguage } = useTranslation()
  const [showNotifications, setShowNotifications] = useState(false)
  const copy = navbarText[locale] || navbarText.fr

  const notifications = [
    {
      id: 1,
      text: locale === 'ar'
        ? 'تم تعيين مهمة جديدة إليك في مشروع DevCollab'
        : locale === 'fr'
          ? 'Une nouvelle tâche vous a été attribuée dans DevCollab'
          : 'A new task was assigned to you in DevCollab',
      time: locale === 'ar' ? 'منذ 5 دقائق' : locale === 'fr' ? 'Il y a 5 min' : '5 min ago',
      unread: true,
    },
    {
      id: 2,
      text: locale === 'ar'
        ? 'أضاف أحد أعضاء الفريق تعليقاً جديداً'
        : locale === 'fr'
          ? 'Un membre a ajouté un commentaire'
          : 'A teammate added a new comment',
      time: locale === 'ar' ? 'منذ ساعة' : locale === 'fr' ? 'Il y a 1 h' : '1 hour ago',
      unread: false,
    },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/75 bg-white/85 shadow-[0_4px_18px_-12px_rgba(15,23,42,0.2)] backdrop-blur-2xl">
      <div className="mx-auto flex h-[68px] max-w-[1680px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-7">
        <Link
          href="/workspaces"
          className="group flex min-w-0 items-center gap-3 no-underline"
          aria-label="DevCollab"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-600/25 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
            <Sparkles size={20} strokeWidth={2.2} />
          </span>
          <span className="truncate text-[1.2rem] font-extrabold tracking-[-0.045em] text-slate-900 sm:text-[1.35rem]">
            Dev<span className="text-indigo-600">Collab</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <Link
            href="/workspaces"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700"
          >
            {copy.workspace}
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700"
          >
            {copy.dashboard}
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-slate-50 p-1"
            aria-label="Language"
          >
            <Languages className="mx-1 hidden text-slate-400 sm:block" size={15} aria-hidden="true" />
            {languages.map((language) => (
              <button
                key={language.value}
                type="button"
                onClick={() => changeLanguage(language.value)}
                aria-pressed={locale === language.value}
                className={`min-h-7 rounded-lg px-2 text-[0.7rem] font-bold transition ${
                  locale === language.value
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((isOpen) => !isOpen)}
              aria-label={copy.notifications}
              aria-expanded={showNotifications}
              className="relative grid size-10 place-items-center rounded-xl border border-slate-200/80 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500" />
            </button>

            {showNotifications && (
              <div className="absolute end-0 top-[calc(100%+12px)] z-50 w-[min(340px,calc(100vw-24px))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900">{copy.notifications}</h2>
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-[0.68rem] font-bold text-indigo-700">
                    1 {copy.new}
                  </span>
                </div>
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-xl border p-3 ${
                        notification.unread
                          ? 'border-indigo-100 bg-indigo-50/60'
                          : 'border-slate-100 bg-slate-50/70'
                      }`}
                    >
                      <p className="text-xs font-medium leading-5 text-slate-700">{notification.text}</p>
                      <p className="mt-1 text-[0.68rem] text-slate-400">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-s border-slate-200 ps-3 sm:gap-3 sm:ps-4">
            {user && (
              <div className="hidden min-w-0 text-end sm:block">
                <p className="max-w-36 truncate text-xs font-bold text-slate-800">
                  {user.fullName || user.firstName || copy.account}
                </p>
                <p className="max-w-40 truncate text-[0.68rem] text-slate-400">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            )}
            <UserButton
              afterSignOutUrl="/login"
              appearance={{
                elements: {
                  avatarBox: 'size-9 ring-2 ring-indigo-100',
                },
              }}
            />
            <ChevronDown className="hidden text-slate-400 sm:block" size={14} aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  )
}
