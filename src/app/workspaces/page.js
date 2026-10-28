'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

export default function WorkspacesPage() {
  const { t, locale } = useTranslation()
  const { user } = useUser() // جلب بيانات المستخدم من Clerk
  
  const [workspaces, setWorkspaces] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchWorkspaces = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', user.id) // جلب مساحات العمل الخاصة بهذا المستخدم فقط

    if (error) console.error('Error fetching workspaces:', error.message)
    else setWorkspaces(data || [])
  }

  useEffect(() => {
    if (user) {
      fetchWorkspaces()
    }
  }, [user])

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!name.trim() || !user) return

    setLoading(true)
    const { error } = await supabase.from('workspaces').insert([
      {
        name,
        description,
        user_id: user.id // حفظ معرف المستخدم مع مساحة العمل
      }
    ])

    if (error) {
      console.error('Error creating workspace:', error.message)
    } else {
      setName('')
      setDescription('')
      fetchWorkspaces()
    }
    setLoading(false)
  }

  const handleDeleteWorkspace = async (id) => {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting workspace:', error.message)
    } else {
      fetchWorkspaces()
    }
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            {locale === 'ar' ? 'مساحات العمل' : locale === 'fr' ? 'Espaces de travail' : 'Workspaces'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {locale === 'ar' ? 'إدارة مشاريعك وفريقك بكل احترافية' : locale === 'fr' ? 'Gérez vos projets et votre équipe' : 'Manage your projects efficiently'}
          </p>
        </div>
      </div>

      {/* Form لإنشاء مساحة عمل جديدة */}
      <form onSubmit={handleCreateWorkspace} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {locale === 'ar' ? 'إنشاء مساحة عمل جديدة' : locale === 'fr' ? 'Créer un nouvel espace' : 'Create New Workspace'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {locale === 'ar' ? 'اسم المساحة' : locale === 'fr' ? "Nom de l'espace" : 'Workspace Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="e.g. Marketing Team"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {locale === 'ar' ? 'الوصف' : locale === 'fr' ? 'Description' : 'Description'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="e.g. Main workspace for projects"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-500/10"
        >
          {loading ? '...' : (locale === 'ar' ? 'إضافة المساحة' : locale === 'fr' ? 'Ajouter' : 'Create Workspace')}
        </button>
      </form>

      {/* قائمة مساحات العمل */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {locale === 'ar' ? 'مساحات العمل الخاصة بك' : locale === 'fr' ? 'Vos espaces' : 'Your Workspaces'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspaces.map((ws) => (
          <div key={ws.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition">
            <div>
              <Link href={`/workspaces/${ws.id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition">
                {ws.name}
              </Link>
              <p className="text-gray-500 text-xs mt-1">{ws.description || '---'}</p>
            </div>
            <button
              onClick={() => handleDeleteWorkspace(ws.id)}
              className="text-gray-400 hover:text-red-600 p-2 rounded-lg transition"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        ))}
        {workspaces.length === 0 && (
          <p className="text-gray-400 text-sm italic col-span-2">
            {locale === 'ar' ? 'لا توجد مساحات عمل حالياً. أنشئ واحدة للبدء!' : locale === 'fr' ? 'Aucun espace trouvé.' : 'No workspaces found.'}
          </p>
        )}
      </div>
    </main>
  )
}