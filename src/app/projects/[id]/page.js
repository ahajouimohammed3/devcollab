'use client'

import { useState, useEffect, use, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'
import Link from 'next/link'

function ProjectContent({ params }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id

  const { t, locale, changeLanguage } = useTranslation()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // حالة الفلتر الجديدة
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projError) console.error('Error fetching project:', projError.message)
    else setProject(projData)

    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)

    if (taskError) console.error('Error fetching tasks:', taskError.message)
    else setTasks(taskData || [])
  }

  useEffect(() => {
    if (projectId) fetchData()
  }, [projectId])

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    setLoading(true)
    const { error } = await supabase.from('tasks').insert([
      {
        title: taskTitle,
        description: taskDesc,
        status: 'todo',
        project_id: projectId
      }
    ])

    if (error) {
      console.error('Error creating task details:', error.message)
    } else {
      setTaskTitle('')
      setTaskDesc('')
      fetchData()
    }
    setLoading(false)
  }

  const handleUpdateStatus = async (taskId, newStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task status:', error.message)
    } else {
      fetchData()
    }
  }

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error.message)
    } else {
      fetchData()
    }
  }

  // تصفية المهام بناءً على شريط البحث والفلتر
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = statusFilter === 'all' || task.status === statusFilter

    return matchesSearch && matchesFilter
  })

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo')
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress')
  const doneTasks = filteredTasks.filter((t) => t.status === 'done')

  return (
    <main className="p-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        {project && (
          <Link className="text-blue-600 hover:underline text-sm font-medium" href={`/workspaces/${project.workspace_id}`}>
            ← {locale === 'ar' ? 'مساحة العمل' : locale === 'fr' ? 'Espace de travail' : 'Back to Workspace'}
          </Link>
        )}
        <div className="flex gap-2">
          <button onClick={() => changeLanguage('fr')} className={`px-3 py-1 text-xs rounded ${locale === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Français</button>
          <button onClick={() => changeLanguage('ar')} className={`px-3 py-1 text-xs rounded ${locale === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>العربية</button>
          <button onClick={() => changeLanguage('en')} className={`px-3 py-1 text-xs rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>English</button>
        </div>
      </div>

      {/* Project Header */}
      {project && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
          <p className="text-gray-600 mt-2">{project.description || '---'}</p>
        </div>
      )}

      {/* Form لإضافة مهمة جديدة */}
      <form onSubmit={handleCreateTask} className="bg-white p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-xl font-semibold mb-4">{t('projects.createTitle')}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('projects.nameLabel')}</label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder={t('projects.namePlaceholder')}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('projects.descLabel')}</label>
          <textarea
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
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

      {/* شريط البحث وأزرار الفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === 'ar' ? 'بحث عن مهمة...' : locale === 'fr' ? 'Rechercher une tâche...' : 'Search tasks...'}
          className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button 
            onClick={() => setStatusFilter('all')} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
          >
            {locale === 'ar' ? 'الكل' : locale === 'fr' ? 'Tous' : 'All'}
          </button>
          <button 
            onClick={() => setStatusFilter('todo')} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${statusFilter === 'todo' ? 'bg-gray-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
          >
            📌 {locale === 'ar' ? 'قيد الانتظار' : locale === 'fr' ? 'À faire' : 'To Do'}
          </button>
          <button 
            onClick={() => setStatusFilter('in_progress')} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${statusFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
          >
            ⏳ {locale === 'ar' ? 'قيد الإنجاز' : locale === 'fr' ? 'En cours' : 'In Progress'}
          </button>
          <button 
            onClick={() => setStatusFilter('done')} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${statusFilter === 'done' ? 'bg-green-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
          >
            ✅ {locale === 'ar' ? 'مكتملة' : locale === 'fr' ? 'Terminé' : 'Done'}
          </button>
        </div>
      </div>

      {/* لوحة التحكم Kanban Board */}
      <h2 className="text-2xl font-semibold mb-4">{t('projects.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* العمود 1: To Do */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
            <span>📌 {locale === 'ar' ? 'قيد الانتظار' : locale === 'fr' ? 'À faire' : 'To Do'}</span>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{todoTasks.length}</span>
          </h3>
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 relative group">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800">{task.title}</h4>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-600 text-xs transition"
                    title="Delete Task"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-1">{task.description || '---'}</p>
                <div className="mt-3 flex justify-end gap-1">
                  <button 
                    onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                  >
                    Start →
                  </button>
                </div>
              </div>
            ))}
            {todoTasks.length === 0 && <p className="text-gray-400 text-xs italic">{t('projects.noTasks')}</p>}
          </div>
        </div>

        {/* العمود 2: In Progress */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold text-blue-700 mb-3 flex justify-between items-center">
            <span>⏳ {locale === 'ar' ? 'قيد الإنجاز' : locale === 'fr' ? 'En cours' : 'In Progress'}</span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
          </h3>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 relative group">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800">{task.title}</h4>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-600 text-xs transition"
                    title="Delete Task"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-1">{task.description || '---'}</p>
                <div className="mt-3 flex justify-between gap-1">
                  <button 
                    onClick={() => handleUpdateStatus(task.id, 'todo')}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                  >
                    ← Back
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(task.id, 'done')}
                    className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100"
                  >
                    Done ✓
                  </button>
                </div>
              </div>
            ))}
            {inProgressTasks.length === 0 && <p className="text-gray-400 text-xs italic">{t('projects.noTasks')}</p>}
          </div>
        </div>

        {/* العمود 3: Done */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold text-green-700 mb-3 flex justify-between items-center">
            <span>✅ {locale === 'ar' ? 'مكتملة' : locale === 'fr' ? 'Terminé' : 'Done'}</span>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{doneTasks.length}</span>
          </h3>
          <div className="space-y-3">
            {doneTasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 opacity-80 relative group">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800 line-through">{task.title}</h4>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-600 text-xs transition"
                    title="Delete Task"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-1">{task.description || '---'}</p>
                <div className="mt-3 flex justify-start gap-1">
                  <button 
                    onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                  >
                    ← Reopen
                  </button>
                </div>
              </div>
            ))}
            {doneTasks.length === 0 && <p className="text-gray-400 text-xs italic">{t('projects.noTasks')}</p>}
          </div>
        </div>

      </div>
    </main>
  )
}

export default function ProjectDetailsPage({ params }) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ProjectContent params={params} />
    </Suspense>
  )
}