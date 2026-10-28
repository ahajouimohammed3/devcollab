'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'
import Link from 'next/link'

export default function DashboardPage() {
  const { t, locale, changeLanguage } = useTranslation()
  const [stats, setStats] = useState({
    workspacesCount: 0,
    projectsCount: 0,
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)

    // 1. Récupérer le nombre d'espaces de travail
    const { count: wsCount } = await supabase
      .from('workspaces')
      .select('*', { count: 'exact', head: true })

    // 2. Récupérer le nombre de projets
    const { count: projCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    // 3. Récupérer toutes les tâches pour calculer leur répartition par statut
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('status')

    if (!tasksError && tasksData) {
      const total = tasksData.length
      const todo = tasksData.filter((t) => t.status === 'todo').length
      const inProgress = tasksData.filter((t) => t.status === 'in_progress').length
      const done = tasksData.filter((t) => t.status === 'done').length

      setStats({
        workspacesCount: wsCount || 0,
        projectsCount: projCount || 0,
        totalTasks: total,
        todoTasks: todo,
        inProgressTasks: inProgress,
        doneTasks: done,
      })
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Calculer le taux d'achèvement en pourcentage
  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.doneTasks / stats.totalTasks) * 100) 
    : 0

  return (
    <main className="p-8 max-w-6xl mx-auto">
      {/* Navigation et barre supérieure */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/workspaces" className="text-blue-600 hover:underline text-sm font-medium">
            ← {locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            📊 {locale === 'ar' ? 'لوحة الإحصائيات' : locale === 'fr' ? 'Tableau de bord' : 'Dashboard Statistics'}
          </h1>
        </div>

        <div className="flex gap-2">
          <button onClick={() => changeLanguage('fr')} className={`px-3 py-1 text-xs rounded ${locale === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Français</button>
          <button onClick={() => changeLanguage('ar')} className={`px-3 py-1 text-xs rounded ${locale === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>العربية</button>
          <button onClick={() => changeLanguage('en')} className={`px-3 py-1 text-xs rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>English</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          {locale === 'ar' ? 'جاري تحميل الإحصائيات...' : 'Loading statistics...'}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Cartes récapitulatives */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-medium text-gray-500">
                {locale === 'ar' ? 'مساحات العمل' : locale === 'fr' ? 'Espaces' : 'Workspaces'}
              </span>
              <p className="text-4xl font-extrabold text-blue-600 mt-2">{stats.workspacesCount}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-medium text-gray-500">
                {locale === 'ar' ? 'المشاريع' : locale === 'fr' ? 'Projets' : 'Projects'}
              </span>
              <p className="text-4xl font-extrabold text-indigo-600 mt-2">{stats.projectsCount}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-medium text-gray-500">
                {locale === 'ar' ? 'إجمالي المهام' : locale === 'fr' ? 'Total Tâches' : 'Total Tasks'}
              </span>
              <p className="text-4xl font-extrabold text-gray-800 mt-2">{stats.totalTasks}</p>
            </div>
          </div>

          {/* Répartition des tâches par statut */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {locale === 'ar' ? 'توزيع حالات المهام' : locale === 'fr' ? 'Répartition des tâches' : 'Tasks Status Breakdown'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <span className="text-xs text-gray-500 font-semibold uppercase">📌 To Do</span>
                <p className="text-2xl font-bold text-gray-700 mt-1">{stats.todoTasks}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <span className="text-xs text-blue-600 font-semibold uppercase">⏳ In Progress</span>
                <p className="text-2xl font-bold text-blue-700 mt-1">{stats.inProgressTasks}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <span className="text-xs text-green-600 font-semibold uppercase">✅ Done</span>
                <p className="text-2xl font-bold text-green-700 mt-1">{stats.doneTasks}</p>
              </div>
            </div>

            {/* Barre de progression */}
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>{locale === 'ar' ? 'نسبة الإنجاز الكلية' : locale === 'fr' ? 'Taux d’achèvement' : 'Overall Completion Rate'}</span>
                <span>{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-500" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}