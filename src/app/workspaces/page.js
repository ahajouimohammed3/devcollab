'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'
import Link from 'next/link'

export default function WorkspacesPage() {
  const { t, locale, changeLanguage } = useTranslation()
  const [workspaces, setWorkspaces] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  // جلب مساحات العمل من Supabase
  const fetchWorkspaces = async () => {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workspaces:', error.message)
    } else {
      setWorkspaces(data || [])
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  // إنشاء مساحة عمل جديدة مع طباعة تفاصيل الخطأ بوضوح
  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const { error } = await supabase.from('workspaces').insert([
      { name, description }
    ])

    if (error) {
      console.error('Error creating workspace details:', error.message, error.details, error.hint)
    } else {
      setName('')
      setDescription('')
      fetchWorkspaces()
    }
    setLoading(false)
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      {/* Top Bar & Language Switcher */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('workspaces.title')}</h1>
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

      {/* Form لإضافة Workspace جديد */}
      <form onSubmit={handleCreateWorkspace} className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('workspaces.createTitle')}</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {t('workspaces.nameLabel')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('workspaces.namePlaceholder')}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {t('workspaces.descLabel')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('workspaces.descPlaceholder')}
            rows="3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:bg-blue-300"
        >
          {loading ? t('workspaces.loading') : t('workspaces.submitBtn')}
        </button>
      </form>

      {/* قائمة مساحات العمل */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspaces.map((ws) => (
          <Link 
            key={ws.id} 
            href={`/workspaces/${ws.id}`}
            className="block bg-white p-5 rounded-lg shadow border border-gray-100 hover:border-blue-500 hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-xl font-bold text-gray-800">{ws.name}</h3>
            <p className="text-gray-600 mt-2 text-sm">{ws.description || '---'}</p>
          </Link>
        ))}
        {workspaces.length === 0 && (
          <p className="text-gray-500 col-span-2 text-center py-8">
            {t('workspaces.noWorkspaces')}
          </p>
        )}
      </div>
    </main>
  )
}