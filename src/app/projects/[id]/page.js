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

    if (projError) console.error('Error fetching project:', projError)
    else setProject(projData)

    // جلب المهام التابعة للمشروع
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)

    if (taskError) console.error('Error fetching tasks:', taskError)
    else setTasks(taskData || [])
  }

  useEffect(() => {
    if (projectId) fetchData()
  }, [projectId])

  // إضافة مهمة جديدة
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
      console.error('Error creating task:', error)
    } else {
      setTaskTitle('')
      setTaskDesc('')
      fetchData()
    }
    setLoading(false)
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        {project && (
          <Link className="text-blue-600 hover:underline text-sm font-medium" href={`/workspaces/${project.workspace_id}`}>
            ← Back to Workspace
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
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Task Title</label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="e.g., Design UI layout"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Task description..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? 'Creating...' : 'Add Task'}
        </button>
      </form>

      {/* قائمة المهام */}
      <h2 className="text-2xl font-semibold mb-4">Project Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-semibold uppercase">{task.status}</span>
            <h3 className="text-lg font-bold text-gray-800 mt-2">{task.title}</h3>
            <p className="text-gray-600 mt-1 text-sm">{task.description || '---'}</p>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-500 col-span-3">No tasks found in this project.</p>
        )}
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