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
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskPriority, setTaskPriority] = useState('medium') // حقل الأولوية الجديد
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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
        due_date: taskDueDate || null,
        priority: taskPriority, // حفظ الأولوية
        status: 'todo',
        project_id: projectId
      }
    ])

    if (error) {
      console.error('Error creating task:', error.message)
    } else {
      setTaskTitle('')
      setTaskDesc('')
      setTaskDueDate('')
      setTaskPriority('medium')
      fetchData()
    }
    setLoading(false)
  }

  const handleUpdateStatus = async (taskId, newStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) console.error('Error updating status:', error.message)
    else fetchData()
  }

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) console.error('Error deleting task:', error.message)
    else fetchData()
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">High</span>
      case 'medium':
        return <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">Medium</span>
      case 'low':
        return <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">Low</span>
      default:
        return null
    }
  }

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
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-6">
        {project && (
          <Link className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1" href={`/workspaces/${project.workspace_id}`}>
            ← {locale === 'ar' ? 'مساحة العمل' : locale === 'fr' ? 'Espace de travail' : 'Back to Workspace'}
          </Link>
        )}
      </div>

      {/* Project Header */}
      {project && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">{project.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{project.description || '---'}</p>
        </div>
      )}

      {/* Form لإضافة مهمة جديدة مع الأولوية والتاريخ */}
      <form onSubmit={handleCreateTask} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{t('projects.createTitle')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('projects.nameLabel')}</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder={t('projects.namePlaceholder')}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {locale === 'ar' ? 'تاريخ الاستحقاق' : locale === 'fr' ? "Date d'échéance" : 'Due Date'}
            </label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {locale === 'ar' ? 'الأولوية' : locale === 'fr' ? 'Priorité' : 'Priority'}
            </label>
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="low">{locale === 'ar' ? 'منخفضة' : locale === 'fr' ? 'Basse' : 'Low'}</option>
              <option value="medium">{locale === 'ar' ? 'متوسطة' : locale === 'fr' ? 'Moyenne' : 'Medium'}</option>
              <option value="high">{locale === 'ar' ? 'عالية' : locale === 'fr' ? 'Haute' : 'High'}</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('projects.descLabel')}</label>
          <textarea
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            placeholder={t('projects.descPlaceholder')}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-500/10"
        >
          {loading ? t('projects.loading') : t('projects.submitBtn')}
        </button>
      </form>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === 'ar' ? 'بحث عن مهمة...' : locale === 'fr' ? 'Rechercher une tâche...' : 'Search tasks...'}
          className="flex-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        />
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 text-xs font-bold rounded-xl transition ${statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border text-gray-600'}`}>
            {locale === 'ar' ? 'الكل' : locale === 'fr' ? 'Tous' : 'All'}
          </button>
          <button onClick={() => setStatusFilter('todo')} className={`px-4 py-2 text-xs font-bold rounded-xl transition ${statusFilter === 'todo' ? 'bg-slate-700 text-white' : 'bg-white border text-gray-600'}`}>
            📌 To Do
          </button>
          <button onClick={() => setStatusFilter('in_progress')} className={`px-4 py-2 text-xs font-bold rounded-xl transition ${statusFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>
            ⏳ In Progress
          </button>
          <button onClick={() => setStatusFilter('done')} className={`px-4 py-2 text-xs font-bold rounded-xl transition ${statusFilter === 'done' ? 'bg-emerald-600 text-white' : 'bg-white border text-gray-600'}`}>
            ✅ Done
          </button>
        </div>
      </div>

      {/* لوحة Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* العمود 1: To Do */}
        <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-3 flex justify-between items-center text-sm px-1">
            <span>📌 To Do</span>
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">{todoTasks.length}</span>
          </h3>
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-sm">{task.title}</h4>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-gray-300 hover:text-red-600 text-xs transition">🗑️</button>
                </div>
                <p className="text-gray-500 text-xs mb-3">{task.description || '---'}</p>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    {task.due_date && <span className="text-[11px] text-gray-400">📅 {task.due_date}</span>}
                  </div>
                  <button onClick={() => handleUpdateStatus(task.id, 'in_progress')} className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-100 transition">
                    Start →
                  </button>
                </div>
              </div>
            ))}
            {todoTasks.length === 0 && <p className="text-gray-400 text-xs italic px-1">{t('projects.noTasks')}</p>}
          </div>
        </div>

        {/* العمود 2: In Progress */}
        <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-blue-700 mb-3 flex justify-between items-center text-sm px-1">
            <span>⏳ In Progress</span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
          </h3>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-sm">{task.title}</h4>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-gray-300 hover:text-red-600 text-xs transition">🗑️</button>
                </div>
                <p className="text-gray-500 text-xs mb-3">{task.description || '---'}</p>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    {task.due_date && <span className="text-[11px] text-gray-400">📅 {task.due_date}</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleUpdateStatus(task.id, 'todo')} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-200">←</button>
                    <button onClick={() => handleUpdateStatus(task.id, 'done')} className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition">Done ✓</button>
                  </div>
                </div>
              </div>
            ))}
            {inProgressTasks.length === 0 && <p className="text-gray-400 text-xs italic px-1">{t('projects.noTasks')}</p>}
          </div>
        </div>

        {/* العمود 3: Done */}
        <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-emerald-700 mb-3 flex justify-between items-center text-sm px-1">
            <span>✅ Done</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{doneTasks.length}</span>
          </h3>
          <div className="space-y-3">
            {doneTasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 opacity-80 relative group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-400 line-through text-sm">{task.title}</h4>
                  <button onClick={() => handleDeleteTask(task.id)} className="text-gray-300 hover:text-red-600 text-xs transition">🗑️</button>
                </div>
                <p className="text-gray-400 text-xs mb-3">{task.description || '---'}</p>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    {task.due_date && <span className="text-[11px] text-gray-300">📅 {task.due_date}</span>}
                  </div>
                  <button onClick={() => handleUpdateStatus(task.id, 'in_progress')} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition">
                    ← Reopen
                  </button>
                </div>
              </div>
            ))}
            {doneTasks.length === 0 && <p className="text-gray-400 text-xs italic px-1">{t('projects.noTasks')}</p>}
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