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
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    // جلب تفاصيل المشروع
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projError) console.error('Error fetching project:', projError.message)
    else setProject(projData)

    // جلب المهام التابعة للمشروع
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

  // إضافة مهمة جديدة مع طباعة تفاصيل الخطأ بدقة إن وجدت
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
      console.error('Error creating task details:', error.message, error.details, error.hint)
    } else {
      setTaskTitle('')
      setTaskDesc('')
      fetchData()
    }
    setLoading(false)
  }

  // تغيير حالة المهمة (Kanban Update)
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

  // تصفية المهام حسب الأعمدة الثلاثة
  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const doneTasks = tasks.filter((t) => t.status === 'done')

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

      {/* لوحة التحكم Kanban Board (ثلاثة أعمدة) */}
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
              <div key={task.id} className="bg-white p-4 rounded shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800">{task.title}</h4>
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
            {todoTasks.length === 0 && <p className="text-gray-400 text-xs italic">{locale === 'ar' ? 'لا توجد مهام' : locale === 'fr' ? 'Aucune tâche' : 'No tasks'}</p>}
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
              <div key={task.id} className="bg-white p-4 rounded shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800">{task.title}</h4>
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
            {inProgressTasks.length === 0 && <p className="text-gray-400 text-xs italic">{locale === 'ar' ? 'لا توجد مهام' : locale === 'fr' ? 'Aucune tâche' : 'No tasks'}</p>}
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
              <div key={task.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 opacity-80">
                <h4 className="font-bold text-gray-800 line-through">{task.title}</h4>
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
            {doneTasks.length === 0 && <p className="text-gray-400 text-xs italic">{locale === 'ar' ? 'لا توجد مهام' : locale === 'fr' ? 'Aucune tâche' : 'No tasks'}</p>}
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