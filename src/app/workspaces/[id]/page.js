'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'
import Link from 'next/link'

export default function WorkspaceDetailsPage({ params }) {
  const resolvedParams = use(params)
  const workspaceId = resolvedParams.id

  const { t, locale, changeLanguage } = useTranslation()
  const [workspace, setWorkspace] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [loading, setLoading] = useState(false)

  // جلب تفاصيل الـ Workspace والمشاريع التابعة له
  const fetchData = async () => {
    // جلب Workspace
    const { data: wsData, error: wsError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single()

    if (wsError) console.error('Error fetching workspace:', wsError)
    else setWorkspace(wsData)

    // جلب Projects
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)

    if (projError) console.error('Error fetching projects:', projError)
    else setProjects(projData || [])
  }

  useEffect(() => {
    if (workspaceId) fetchData()
  }, [workspaceId])

  // إضافة مشروع جديد
  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!projectName.trim()) return

    setLoading(true)
    const { error } = await supabase.from('projects').insert([
      {
        name: projectName,
        description: projectDesc,
        workspace_id: workspaceId
      }
    ])

    if (error) {
      console.error('Error creating project:', error)
    } else {
      setProjectName('')
      setProjectDesc('')
      fetchData()
    }
    setLoading(false)
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      {/* Top Bar & Language Switcher */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/workspaces" className="text-blue-600 hover:underline text-sm font-medium">
          ← {t('workspaces.title')}
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => changeLanguage('fr')} 
            className={`px-3 py-1 text-xs rounded ${locale === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Français
          </button>
          <button 
            onClick={() => changeLanguage('ar')} 
            className={`px-3 py-1 text-xs rounded ${locale === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            العربية
          </button>
          <button 
            onClick={() => changeLanguage('en')} 
            className={`px-3 py-1 text-xs rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            English
          </button>
        </div>
      </div>

      {/* Workspace Header */}
      {workspace && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{workspace.name}</h1>
          <p className="text-gray-600 mt-2">{workspace.description || '---'}</p>
        </div>
      )}

      {/* Form لإضافة Project جديد */}
      <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-xl font-semibold mb-4">{t('projects.createTitle')}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('projects.nameLabel')}</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder={t('projects.namePlaceholder')}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('projects.descLabel')}</label>
          <textarea
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder={t('projects.descPlaceholder')}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? t('projects.loading') : t('projects.submitBtn')}
        </button>
      </form>

      {/* قائمة المشاريع */}
      <h2 className="text-2xl font-semibold mb-4">{t('projects.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-5 rounded-lg shadow border border-gray-100 hover:border-blue-300 transition">
            <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
            <p className="text-gray-600 mt-2 text-sm">{project.description || '---'}</p>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-500">{t('projects.noProjects')}</p>
        )}
      </div>
    </main>
  )
}