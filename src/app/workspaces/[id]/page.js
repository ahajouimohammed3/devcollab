'use client'

import { useState, useEffect, use, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

function WorkspaceContent({ params }) {
  const resolvedParams = use(params)
  const workspaceId = resolvedParams.id

  const { t, locale } = useTranslation()
  const { user } = useUser()

  const [workspace, setWorkspace] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    if (!user) return

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
  }

  useEffect(() => {
    if (workspaceId && user) fetchData()
  }, [workspaceId, user])

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
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Error deleting project:', error.message)
    } else {
      fetchData()
    }
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      {/* Navigation supérieure */}
      <div className="mb-6">
        <Link className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1" href="/workspaces">
          ← {locale === 'ar' ? 'الرجوع لمساحات العمل' : locale === 'fr' ? 'Retour aux espaces' : 'Back to Workspaces'}
        </Link>
      </div>

      {/* En-tête de l'espace de travail */}
      {workspace && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">{workspace.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{workspace.description || '---'}</p>
        </div>
      )}

      {/* Formulaire de création d'un nouveau projet */}
      <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {locale === 'ar' ? 'إضافة مشروع جديد' : locale === 'fr' ? 'Créer un nouveau projet' : 'Create New Project'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {locale === 'ar' ? 'اسم المشروع' : locale === 'fr' ? 'Nom du projet' : 'Project Name'}
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="e.g. Redesign Landing Page"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {locale === 'ar' ? 'الوصف' : locale === 'fr' ? 'Description' : 'Description'}
            </label>
            <input
              type="text"
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="e.g. Tasks for UI design"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-500/10"
        >
          {loading ? '...' : (locale === 'ar' ? 'إضافة المشروع' : locale === 'fr' ? 'Ajouter' : 'Create Project')}
        </button>
      </form>

      {/* Liste des projets */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {locale === 'ar' ? 'المشاريع' : locale === 'fr' ? 'Projets' : 'Projects'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition">
            <div>
              <Link href={`/projects/${proj.id}`} className="text-base font-bold text-gray-900 hover:text-blue-600 transition">
                🚀 {proj.name}
              </Link>
              <p className="text-gray-500 text-xs mt-1">{proj.description || '---'}</p>
            </div>
            <button
              onClick={() => handleDeleteProject(proj.id)}
              className="text-gray-400 hover:text-red-600 p-1 rounded transition"
            >
              🗑️
            </button>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-400 text-sm italic col-span-3">
            {locale === 'ar' ? 'لا توجد مشاريع حالياً.' : locale === 'fr' ? 'Aucun projet trouvé.' : 'No projects found.'}
          </p>
        )}
      </div>
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