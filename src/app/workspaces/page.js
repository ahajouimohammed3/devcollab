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
      console.error('Error fetching workspaces:', error.message)
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
      {/* Top Bar with Languages and Dashboard Link */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('workspaces.title')}</h1>
        
        <div className="flex items-center gap-3">
          {/* زر الانتقال للوحة الإحصائيات */}
          <Link 
            href="/dashboard" 
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700 transition flex items-center gap-1 shadow-sm"
          >
            📊 {locale === 'ar' ? 'الإحصائيات' : locale === 'fr' ? 'Statistiques' : 'Dashboard'}
          </Link>

          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => changeLanguage('fr')} className={`px-3 py-1 text-xs rounded-md transition ${locale === 'fr' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-200'}`}>Français</button>
            <button onClick={() => changeLanguage('ar')} className={`px-3 py-1 text-xs rounded-md transition ${locale === 'ar' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-200'}`}>العربية</button>
            <button onClick={() => changeLanguage('en')} className={`px-3 py-1 text-xs rounded-md transition ${locale === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-200'}`}>English</button>
          </div>
        </div>
      </div>

      {/* Form لإضافة مساحة عمل جديدة */}
      <form onSubmit={handleCreateWorkspace} className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('workspaces.createTitle')}</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-600">{t('workspaces.nameLabel')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('workspaces.namePlaceholder')}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-600">{t('workspaces.descLabel')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('workspaces.descPlaceholder')}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
        >
          {loading ? t('workspaces.loading') : t('workspaces.submitBtn')}
        </button>
      </form>

      {/* قائمة مساحات العمل */}
      <div className="grid grid-cols-1 gap-4">
        {workspaces.map((ws) => (
          <div key={ws.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{ws.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{ws.description || '---'}</p>
            </div>
            <Link
              href={`/workspaces/${ws.id}`}
              className="bg-gray-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition border border-gray-200"
            >
              {locale === 'ar' ? 'عرض المشاريع ←' : locale === 'fr' ? 'Voir Projets ←' : 'View Projects →'}
            </Link>
          </div>
        ))}
        {workspaces.length === 0 && (
          <p className="text-gray-400 text-center py-8">{t('workspaces.noWorkspaces')}</p>
        )}
      </div>
    </main>
  )
}