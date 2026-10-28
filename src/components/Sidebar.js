'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { useTranslation } from '@/context/LanguageContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function SidebarContent() {
  const { user } = useUser()
  const { locale } = useTranslation()
  const pathname = usePathname()
  
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSidebarData = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('user_id', user.id)

      if (!error) setWorkspaces(data || [])
      setLoading(false)
    }

    fetchSidebarData()
  }, [user, pathname])

  if (!user) return null

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 border-r border-slate-800 flex flex-col justify-between">
      <div>
        {/* Quick Links */}
        <div className="mb-6 space-y-1">
          <Link
            href="/workspaces"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
              pathname === '/workspaces'
                ? 'bg-blue-600 text-white font-semibold'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>📁</span>
            <span>{locale === 'ar' ? 'مساحات العمل' : locale === 'fr' ? 'Espaces de travail' : 'Workspaces'}</span>
          </Link>
        </div>

        {/* Workspaces List */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {locale === 'ar' ? 'المساحات الخاصة بك' : locale === 'fr' ? 'Vos espaces' : 'Your Workspaces'}
          </h3>

          {loading ? (
            <div className="px-3 text-xs text-slate-500">...</div>
          ) : (
            <div className="space-y-1">
              {workspaces.map((ws) => {
                const isActive = pathname.startsWith(`/workspaces/${ws.id}`)
                return (
                  <Link
                    key={ws.id}
                    href={`/workspaces/${ws.id}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold border-r-4 border-blue-500'
                        : 'hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">
                      WS
                    </span>
                  </Link>
                )
              })}

              {workspaces.length === 0 && (
                <p className="px-3 text-xs text-slate-500 italic">
                  {locale === 'ar' ? 'لا توجد مساحات' : 'No workspaces'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        DevCollab v1.0 • Trello Edition
      </div>
    </aside>
  )
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="w-64 bg-slate-900 min-h-[calc(100vh-4rem)] p-4 border-r border-slate-800"></div>}>
      <SidebarContent />
    </Suspense>
  )
}