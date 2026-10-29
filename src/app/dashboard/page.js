'use client'

import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  FolderKanban,
  LoaderCircle,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'

const dashboardText = {
  fr: {
    eyebrow: 'Votre espace de pilotage',
    title: 'Tableau de bord',
    subtitle: 'Un aperçu clair de vos espaces, projets et tâches.',
    workspaces: 'Espaces de travail',
    projects: 'Projets',
    totalTasks: 'Tâches au total',
    progress: 'Avancement des tâches',
    todo: 'À faire',
    inProgress: 'En cours',
    done: 'Terminées',
    completion: 'Taux de réalisation',
    loading: 'Préparation de votre tableau de bord...',
    error: 'Impossible de charger les statistiques. Veuillez réessayer.',
    action: 'Voir mes espaces',
    completedOf: (done, total) => `${done} sur ${total} tâches terminées`,
  },
  en: {
    eyebrow: 'Your command center',
    title: 'Dashboard',
    subtitle: 'A clear overview of your workspaces, projects, and tasks.',
    workspaces: 'Workspaces',
    projects: 'Projects',
    totalTasks: 'Total tasks',
    progress: 'Task progress',
    todo: 'To do',
    inProgress: 'In progress',
    done: 'Completed',
    completion: 'Completion rate',
    loading: 'Preparing your dashboard...',
    error: 'Could not load statistics. Please try again.',
    action: 'Explore workspaces',
    completedOf: (done, total) => `${done} of ${total} tasks completed`,
  },
  ar: {
    eyebrow: 'مركز إدارة أعمالك',
    title: 'لوحة التحكم',
    subtitle: 'نظرة واضحة على مساحات العمل والمشاريع والمهام.',
    workspaces: 'مساحات العمل',
    projects: 'المشاريع',
    totalTasks: 'إجمالي المهام',
    progress: 'تقدم المهام',
    todo: 'قيد الانتظار',
    inProgress: 'قيد التنفيذ',
    done: 'مكتملة',
    completion: 'معدل الإنجاز',
    loading: 'جارٍ إعداد لوحة التحكم...',
    error: 'تعذر تحميل الإحصائيات. يرجى المحاولة مرة أخرى.',
    action: 'استكشف مساحات العمل',
    completedOf: (done, total) => `${done} من ${total} مهام مكتملة`,
  },
}

const initialStats = {
  workspacesCount: 0,
  projectsCount: 0,
  totalTasks: 0,
  todoTasks: 0,
  inProgressTasks: 0,
  doneTasks: 0,
}

export default function DashboardPage() {
  const { locale } = useTranslation()
  const copy = dashboardText[locale] || dashboardText.fr
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchStats = async () => {
      try {
        const [workspaceResult, projectResult, taskResult] = await Promise.all([
          supabase.from('workspaces').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('tasks').select('status'),
        ])

        if (workspaceResult.error) throw workspaceResult.error
        if (projectResult.error) throw projectResult.error
        if (taskResult.error) throw taskResult.error

        if (cancelled) return

        const tasks = taskResult.data || []
        setStats({
          workspacesCount: workspaceResult.count || 0,
          projectsCount: projectResult.count || 0,
          totalTasks: tasks.length,
          todoTasks: tasks.filter((task) => task.status === 'todo').length,
          inProgressTasks: tasks.filter((task) => task.status === 'in_progress').length,
          doneTasks: tasks.filter((task) => task.status === 'done').length,
        })
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error)
        if (!cancelled) setHasError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [])

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
    : 0

  const metrics = [
    {
      label: copy.workspaces,
      value: stats.workspacesCount,
      icon: BriefcaseBusiness,
      accent: 'from-indigo-500 to-violet-600',
      glow: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: copy.projects,
      value: stats.projectsCount,
      icon: FolderKanban,
      accent: 'from-violet-500 to-fuchsia-600',
      glow: 'bg-violet-100 text-violet-700',
    },
    {
      label: copy.totalTasks,
      value: stats.totalTasks,
      icon: ClipboardList,
      accent: 'from-slate-600 to-slate-800',
      glow: 'bg-slate-100 text-slate-700',
    },
  ]

  const taskStatuses = [
    { label: copy.todo, value: stats.todoTasks, icon: CircleDashed, color: 'text-slate-600', tint: 'bg-slate-100' },
    { label: copy.inProgress, value: stats.inProgressTasks, icon: LoaderCircle, color: 'text-indigo-700', tint: 'bg-indigo-50' },
    { label: copy.done, value: stats.doneTasks, icon: CheckCircle2, color: 'text-emerald-700', tint: 'bg-emerald-50' },
  ]

  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1280px] px-4 py-8 sm:px-7 sm:py-12" dir={direction}>
      <header className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
            <Sparkles size={15} aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-slate-900 sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            {copy.subtitle}
          </p>
        </div>
        <Link
          href="/workspaces"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white no-underline shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 sm:self-auto"
        >
          {copy.action}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </header>

      {hasError && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {copy.error}
        </div>
      )}

      {loading ? (
        <div className="luxury-card flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center text-slate-500" role="status">
          <LoaderCircle className="animate-spin text-indigo-600" size={26} aria-hidden="true" />
          <p className="m-0 text-sm font-medium">{copy.loading}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label={copy.eyebrow}>
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <article key={metric.label} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_-16px_rgba(15,23,42,0.2)] transition hover:-translate-y-1 hover:shadow-xl sm:p-6">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metric.accent}`} />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-sm font-semibold text-slate-500">{metric.label}</p>
                      <p className="mb-0 mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
                        {metric.value}
                      </p>
                    </div>
                    <span className={`grid size-11 place-items-center rounded-[14px] ${metric.glow}`}>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                  </div>
                </article>
              )
            })}
          </section>

          <section className="luxury-card p-5 sm:p-7" aria-labelledby="task-progress-title">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 id="task-progress-title" className="m-0 text-lg font-bold tracking-tight text-slate-900">
                  {copy.progress}
                </h2>
                <p className="mb-0 mt-1 text-sm text-slate-500">
                  {copy.completedOf(stats.doneTasks, stats.totalTasks)}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-xl bg-indigo-50 px-3 py-2 text-indigo-700 sm:self-auto">
                <CheckCircle2 size={17} aria-hidden="true" />
                <span className="text-sm font-bold">{copy.completion}</span>
                <span className="text-lg font-extrabold">{completionRate}%</span>
              </div>
            </div>

            <div
              className="mb-7 h-3 overflow-hidden rounded-full bg-slate-100 p-[2px]"
              role="progressbar"
              aria-label={copy.completion}
              aria-valuenow={completionRate}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-[width] duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {taskStatuses.map((status) => {
                const Icon = status.icon
                return (
                  <div key={status.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/75 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${status.tint} ${status.color}`}>
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span className="truncate text-sm font-semibold text-slate-600">{status.label}</span>
                    </div>
                    <span className={`text-xl font-extrabold ${status.color}`}>{status.value}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
