'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { BriefcaseBusiness, LayoutDashboard, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'

const sidebarText = {
  fr: {
    overview: 'Vue d’ensemble',
    dashboard: 'Tableau de bord',
    workspace: 'Espaces de travail',
    yourWorkspaces: 'Vos espaces',
    empty: 'Aucun espace',
    new: 'Nouveau',
    footer: 'Conçu pour mieux collaborer.',
  },
  en: {
    overview: 'Overview',
    dashboard: 'Dashboard',
    workspace: 'Workspaces',
    yourWorkspaces: 'Your workspaces',
    empty: 'No workspaces yet',
    new: 'New',
    footer: 'Made for better collaboration.',
  },
  ar: {
    overview: 'نظرة عامة',
    dashboard: 'لوحة التحكم',
    workspace: 'مساحات العمل',
    yourWorkspaces: 'مساحاتك',
    empty: 'لا توجد مساحات بعد',
    new: 'جديد',
    footer: 'مصمم لتعاون أفضل.',
  },
}

export default function Sidebar() {
  const { isLoaded, user } = useUser()
  const { locale } = useTranslation()
  const pathname = usePathname()
  const [workspaces, setWorkspaces] = useState([])
  const copy = sidebarText[locale] || sidebarText.fr

  useEffect(() => {
    if (!isLoaded || !user) return

    let cancelled = false

    const fetchWorkspaces = async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('user_id', user.id)

      if (cancelled) return
      if (error) {
        console.error('Error fetching sidebar workspaces:', error.message)
      } else {
        setWorkspaces(data || [])
      }
    }

    fetchWorkspaces()

    return () => {
      cancelled = true
    }
  }, [isLoaded, user, pathname])

  if (!isLoaded || !user) return null

  const isWorkspaceList = pathname === '/workspaces'
  const isDashboard = pathname === '/dashboard'

  return (
    <>
      <aside className="app-sidebar" aria-label="Sidebar">
        <p className="app-sidebar-label">{copy.overview}</p>
        <nav className="flex flex-col gap-1" aria-label="Workspace navigation">
          <Link
            href="/dashboard"
            aria-current={isDashboard ? 'page' : undefined}
            className="app-sidebar-link"
          >
            <LayoutDashboard size={18} aria-hidden="true" />
            <span>{copy.dashboard}</span>
          </Link>
          <Link
            href="/workspaces"
            aria-current={isWorkspaceList ? 'page' : undefined}
            className="app-sidebar-link"
          >
            <BriefcaseBusiness size={18} aria-hidden="true" />
            <span>{copy.workspace}</span>
          </Link>
        </nav>

        <div className="mt-9">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="app-sidebar-label mb-0">{copy.yourWorkspaces}</p>
            <Link
              href="/workspaces"
              aria-label={copy.new}
              className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Plus size={16} />
            </Link>
          </div>
          <nav className="flex flex-col gap-1" aria-label={copy.yourWorkspaces}>
            {workspaces.map((workspace) => {
              const isActive = pathname.startsWith(`/workspaces/${workspace.id}`)

              return (
                <Link
                  key={workspace.id}
                  href={`/workspaces/${workspace.id}`}
                  aria-current={isActive ? 'page' : undefined}
                  className="app-sidebar-link"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    <BriefcaseBusiness size={14} />
                  </span>
                  <span className="min-w-0 flex-1 truncate" dir="auto">{workspace.name}</span>
                </Link>
              )
            })}
            {workspaces.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400">{copy.empty}</p>
            )}
          </nav>
        </div>

        <div className="app-sidebar-footer flex items-center gap-2">
          <Sparkles size={14} className="shrink-0 text-indigo-400" aria-hidden="true" />
          {copy.footer}
        </div>
      </aside>

      <nav className="mobile-app-nav" aria-label="Mobile navigation">
        <Link
          href="/dashboard"
          aria-current={isDashboard ? 'page' : undefined}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-xs font-semibold no-underline ${
            isDashboard ? 'bg-indigo-600 text-white' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard size={16} aria-hidden="true" />
          {copy.dashboard}
        </Link>
        <Link
          href="/workspaces"
          aria-current={isWorkspaceList ? 'page' : undefined}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-xs font-semibold no-underline ${
            isWorkspaceList ? 'bg-indigo-600 text-white' : 'text-slate-500'
          }`}
        >
          <BriefcaseBusiness size={16} aria-hidden="true" />
          {copy.workspace}
        </Link>
      </nav>
    </>
  )
}
