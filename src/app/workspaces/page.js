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

  const fetchWorkspaces = async () => {
    const { data, error } = await supabase.from('workspaces').select('*')
    if (error) {
      console.error('Error fetching workspaces:', error)
    } else {
      setWorkspaces(data || [])
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const { error } = await supabase.from('workspaces').insert([
      {
        name,
        description,
        owner_id: 'user_temp_id'
      }
    ])

    if (error) {
      console.error('Error creating workspace:', error)
    } else {
      setName('')
      setDescription('')
      fetchWorkspaces()
    }
    setLoading(false)
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      {/* Language Switcher */}
      <div className="flex justify-end gap-2 mb-6">
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

      <h1 className="text-3xl font-bold mb-6">{t('workspaces.title')}</h1>

      {/* Form لإضافة Workspace */}
      <form onSubmit={handleCreateWorkspace} className="bg-white p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-xl font-semibold mb-4">{t('workspaces.createTitle')}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('workspaces.nameLabel')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder={t('workspaces.namePlaceholder')}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('workspaces.descLabel')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder={t('workspaces.descPlaceholder')}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? t('workspaces.loading') : t('workspaces.submitBtn')}
        </button>
      </form>

      {/* عرض مساحات العمل مع روابط الصفحات */}
      <h2 className="text-2xl font-semibold mb-4">{t('workspaces.currentList')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspaces.map((ws) => (
          <Link 
            key={ws.id} 
            href={`/workspaces/${ws.id}`}
            className="block bg-white p-5 rounded-lg shadow border hover:shadow-lg hover:border-blue-500 transition cursor-pointer"
          >
            <h3 className="text-xl font-bold text-blue-600">{ws.name}</h3>
            <p className="text-gray-600 mt-2 text-sm">{ws.description || '---'}</p>
          </Link>
        ))}
        {workspaces.length === 0 && (
          <p className="text-gray-500">{t('workspaces.noWorkspaces')}</p>
        )}
      </div>
    </main>
  )
}