'use client'

import { useState, useEffect, use, Suspense, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, LoaderCircle, Plus, Trash2 } from 'lucide-react'

function WorkspaceContent({ params }) {
  const resolvedParams = use(params)
  const workspaceId = resolvedParams.id

  const { locale } = useTranslation()
  const { user } = useUser()

  const [workspace, setWorkspace] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    // Récupérer les données de l'espace de travail
    const { data: wsData, error: wsError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single()

    if (wsError) console.error('Error fetching workspace:', wsError.message)
    else setWorkspace(wsData)

    // Récupérer les projets de cet utilisateur dans cet espace de travail
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)

    if (projError) console.error('Error fetching projects:', projError.message)
    else setProjects(projData || [])
    setIsLoading(false)
  }, [user, workspaceId])

  useEffect(() => {
    if (workspaceId && user) void Promise.resolve().then(fetchData)
  }, [fetchData, workspaceId, user])

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!projectName.trim() || !user) return

    setLoading(true)
    const { error } = await supabase.from('projects').insert([
      {
        name: projectName,
        description: projectDesc,
        workspace_id: workspaceId,
        user_id: user.id // Enregistrer l'identifiant de l'utilisateur
      }
    ])

    if (error) {
      console.error('Error creating project:', error.message)
    } else {
      setProjectName('')
      setProjectDesc('')
      fetchData()
    }
    setLoading(false)
  }

  const handleDeleteProject = async (projectId) => {
    setDeletingProjectId(projectId)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Error deleting project:', error.message)
    } else {
      fetchData()
    }
    setDeletingProjectId(null)
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1180px] px-4 py-8 sm:px-7 sm:py-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Link
        className="mb-7 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 text-sm font-semibold text-slate-600 no-underline transition hover:border-indigo-200 hover:text-indigo-700"
        href="/workspaces"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {locale === 'ar' ? 'العودة إلى مساحات العمل' : locale === 'fr' ? 'Retour aux espaces' : 'Back to workspaces'}
      </Link>

      {workspace && (
        <header className="relative mb-7 overflow-hidden rounded-lg border border-white/80 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white sm:p-9">
          <div className="pointer-events-none absolute -end-16 -top-32 size-80 rounded-full bg-indigo-400/15 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/10 text-indigo-200">
              <BriefcaseBusiness size={22} />
            </span>
            <div className="min-w-0">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-200">
                {locale === 'ar' ? 'مساحة العمل' : locale === 'fr' ? 'Espace de travail' : 'Workspace'}
              </p>
              <h1 className="m-0 break-words text-3xl font-extrabold tracking-tight sm:text-4xl" dir="auto">
                {workspace.name}
              </h1>
              <p className="mb-0 mt-3 max-w-2xl text-sm leading-6 text-slate-300" dir="auto">
                {workspace.description || (locale === 'ar' ? 'مساحة فريقك لإدارة المشاريع.' : locale === 'fr' ? 'Votre espace dédié à la gestion de projets.' : 'Your dedicated space for managing projects.')}
              </p>
            </div>
          </div>
        </header>
      )}

      <section className="luxury-card mb-9 p-5 sm:p-7">
        <div className="mb-6 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <Plus size={19} />
          </span>
          <div>
            <h2 className="m-0 text-lg font-bold tracking-tight text-slate-900">
              {locale === 'ar' ? 'إنشاء مشروع جديد' : locale === 'fr' ? 'Créer un nouveau projet' : 'Create a new project'}
            </h2>
            <p className="mb-0 mt-1 text-sm text-slate-500">
              {locale === 'ar' ? 'اجمع المهام والملفات في مشروع واحد.' : locale === 'fr' ? 'Rassemblez vos tâches et vos idées dans un projet.' : 'Bring tasks and ideas together in one project.'}
            </p>
          </div>
        </div>
        <form onSubmit={handleCreateProject}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="project-name" className="mb-2 block text-sm font-semibold text-slate-700">
                {locale === 'ar' ? 'اسم المشروع' : locale === 'fr' ? 'Nom du projet' : 'Project name'}
              </label>
              <input
                id="project-name"
                type="text"
                dir="auto"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                className="luxury-input"
                placeholder={locale === 'ar' ? 'مثال: تطوير الموقع' : locale === 'fr' ? 'Ex. Refonte du site' : 'e.g. Website refresh'}
                required
              />
            </div>
            <div>
              <label htmlFor="project-description" className="mb-2 block text-sm font-semibold text-slate-700">
                {locale === 'ar' ? 'الوصف' : locale === 'fr' ? 'Description' : 'Description'}
              </label>
              <input
                id="project-description"
                type="text"
                dir="auto"
                value={projectDesc}
                onChange={(event) => setProjectDesc(event.target.value)}
                className="luxury-input"
                placeholder={locale === 'ar' ? 'أضف وصفاً مختصراً' : locale === 'fr' ? 'Ajoutez quelques détails' : 'Add a few details'}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button type="submit" disabled={loading} className="luxury-button">
              {loading ? <LoaderCircle className="animate-spin" size={17} /> : <Plus size={17} />}
              {loading ? (locale === 'ar' ? 'جارٍ الإنشاء...' : locale === 'fr' ? 'Création...' : 'Creating...') : (locale === 'ar' ? 'إضافة المشروع' : locale === 'fr' ? 'Ajouter le projet' : 'Create project')}
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="projects-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="projects-heading" className="m-0 text-xl font-bold tracking-tight text-slate-900">
            {locale === 'ar' ? 'المشاريع' : locale === 'fr' ? 'Projets' : 'Projects'}
          </h2>
          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {projects.length}
          </span>
        </div>

        {isLoading ? (
          <div className="luxury-card flex min-h-48 items-center justify-center gap-3 text-sm font-medium text-slate-500" role="status">
            <LoaderCircle className="animate-spin text-indigo-600" size={21} />
            {locale === 'ar' ? 'جارٍ تحميل المشاريع...' : locale === 'fr' ? 'Chargement des projets...' : 'Loading projects...'}
          </div>
        ) : projects.length === 0 ? (
          <div className="luxury-card flex min-h-52 flex-col items-center justify-center p-8 text-center">
            <span className="mb-3 grid size-12 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <BriefcaseBusiness size={22} />
            </span>
            <h3 className="m-0 text-base font-bold text-slate-800">
              {locale === 'ar' ? 'لا توجد مشاريع بعد' : locale === 'fr' ? 'Aucun projet pour le moment' : 'No projects yet'}
            </h3>
            <p className="mb-0 mt-2 max-w-md text-sm leading-6 text-slate-500">
              {locale === 'ar' ? 'أنشئ مشروعك الأول من النموذج أعلاه.' : locale === 'fr' ? 'Créez votre premier projet à partir du formulaire ci-dessus.' : 'Create your first project using the form above.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article key={project.id} className="group min-w-0 rounded-lg border border-slate-200/80 bg-white p-5 transition hover:-translate-y-1 hover:border-indigo-200">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-violet-50 text-violet-700">
                    <BriefcaseBusiness size={19} />
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deletingProjectId === project.id}
                    className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    aria-label={locale === 'ar' ? 'حذف المشروع' : locale === 'fr' ? 'Supprimer le projet' : 'Delete project'}
                  >
                    {deletingProjectId === project.id ? <LoaderCircle className="animate-spin" size={17} /> : <Trash2 size={17} />}
                  </button>
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  dir="auto"
                  className="block break-words text-base font-bold text-slate-900 no-underline transition group-hover:text-indigo-700"
                >
                  {project.name}
                </Link>
                <p className="mb-5 mt-2 min-h-11 break-words text-sm leading-6 text-slate-500" dir="auto">
                  {project.description || (locale === 'ar' ? 'لا يوجد وصف' : locale === 'fr' ? 'Aucune description' : 'No description provided')}
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-indigo-600">
                  <span>{locale === 'ar' ? 'فتح المشروع' : locale === 'fr' ? 'Ouvrir le projet' : 'Open project'}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default function WorkspaceDetailsPage({ params }) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <WorkspaceContent params={params} />
    </Suspense>
  )
}