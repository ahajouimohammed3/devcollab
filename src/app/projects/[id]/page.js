'use client'

import { useState, useEffect, use, Suspense, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'
import { useRole } from '@/hooks/useRole'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

function ProjectContent({ params }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id

  const { t, locale } = useTranslation()
  
  // 🛡️ Récupération des rôles de l'utilisateur basés sur le workspace du projet
  const [project, setProject] = useState(null)
  const { isAdmin, canEdit, isViewer } = useRole(project?.workspace_id)

  const [tasks, setTasks] = useState([])
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskPriority, setTaskPriority] = useState('medium')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskLabels, setTaskLabels] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  // États pour la modale des tâches et les commentaires
  const [selectedTask, setSelectedTask] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projError) console.error('Erreur lors de la récupération du projet:', projError.message)
    else setProject(projData)

    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)

    if (taskError) console.error('Erreur lors de la récupération des tâches:', taskError.message)
    else setTasks(taskData || [])
  }, [projectId])

  useEffect(() => {
    if (projectId) void Promise.resolve().then(fetchData)
  }, [fetchData, projectId])

  // Récupérer les commentaires de la tâche sélectionnée
  const fetchComments = async (taskId) => {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) console.error('Erreur lors de la récupération des commentaires:', error.message)
    else setComments(data || [])
  }

  const openTaskModal = (task) => {
    setSelectedTask(task)
    fetchComments(task.id)
  }

  const closeTaskModal = () => {
    setSelectedTask(null)
    setComments([])
    setNewComment('')
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedTask || isViewer) return

    setCommentLoading(true)
    const author = commentAuthor.trim() || 'Membre'
    const { error } = await supabase.from('task_comments').insert([
      {
        task_id: selectedTask.id,
        user_name: author,
        content: newComment.trim()
      }
    ])

    if (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error.message)
    } else {
      setNewComment('')
      fetchComments(selectedTask.id)
    }
    setCommentLoading(false)
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!taskTitle.trim() || !canEdit) return

    setLoading(true)
    const { error } = await supabase.from('tasks').insert([
      {
        title: taskTitle,
        description: taskDesc,
        due_date: taskDueDate || null,
        priority: taskPriority,
        assigned_to: taskAssignee.trim() || null,
        labels: taskLabels.trim() || null,
        status: 'todo',
        project_id: projectId
      }
    ])

    if (error) {
      console.error('Erreur lors de la création de la tâche:', error.message)
    } else {
      setTaskTitle('')
      setTaskDesc('')
      setTaskDueDate('')
      setTaskPriority('medium')
      setTaskAssignee('')
      setTaskLabels('')
      fetchData()
    }
    setLoading(false)
  }

  const handleUpdateStatus = async (taskId, newStatus) => {
    if (!canEdit) return

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      console.error('Erreur lors de la mise à jour du statut:', error.message)
      fetchData()
    }
  }

  const handleDeleteTask = async (taskId, e) => {
    if (e) e.stopPropagation()
    if (!isAdmin) return // Suppression réservée aux administrateurs uniquement

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) console.error('Erreur lors de la suppression de la tâche:', error.message)
    else {
      if (selectedTask && selectedTask.id === taskId) closeTaskModal()
      fetchData()
    }
  }

  const onDragEnd = (result) => {
    if (!canEdit) return // Empêcher le Drag & Drop si l'utilisateur est simple Viewer
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId
    handleUpdateStatus(draggableId, newStatus)
  }

  const getPriorityBadge = (priority) => {
    const p = priority ? priority.toLowerCase() : 'medium'
    switch (p) {
      case 'high':
        return <span className="text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2.5 py-1 rounded-lg font-bold tracking-wide">🔥 High</span>
      case 'medium':
        return <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-lg font-bold tracking-wide">⚡ Medium</span>
      case 'low':
        return <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold tracking-wide">🌱 Low</span>
      default:
        return null
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.assigned_to && task.assigned_to.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.labels && task.labels.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter = statusFilter === 'all' || task.status === statusFilter

    return matchesSearch && matchesFilter
  })

  // Calculs statistiques
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
  const todoTasks = tasks.filter((t) => t.status === 'todo').length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const columns = [
    { id: 'todo', title: '📌 To Do', headerColor: 'text-slate-700 bg-slate-100', tasks: filteredTasks.filter((t) => t.status === 'todo') },
    { id: 'in_progress', title: '⏳ In Progress', headerColor: 'text-indigo-700 bg-indigo-50', tasks: filteredTasks.filter((t) => t.status === 'in_progress') },
    { id: 'done', title: '✅ Done', headerColor: 'text-emerald-700 bg-emerald-50', tasks: filteredTasks.filter((t) => t.status === 'done') }
  ]

  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1480px] bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 px-4 py-6 font-sans sm:px-7 sm:py-9" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Top Navigation Back Link */}
      <div className="flex justify-between items-center mb-6">
        {project && (
          <Link 
            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-indigo-100/50 transition-all hover:shadow-md hover:-translate-x-1" 
            href={`/workspaces/${project.workspace_id}`}
          >
            <span>←</span> {locale === 'ar' ? 'مساحة العمل' : locale === 'fr' ? 'Espace de travail' : 'Back to Workspace'}
          </Link>
        )}

        {/* Badge du rôle actuel de l'utilisateur */}
        <div className="flex items-center gap-2">
          {isAdmin && <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold px-3 py-1.5 rounded-xl">👑 Admin</span>}
          {!isAdmin && canEdit && <span className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 text-xs font-bold px-3 py-1.5 rounded-xl">✍️ Member</span>}
          {isViewer && <span className="bg-slate-500/10 text-slate-600 border border-slate-500/20 text-xs font-bold px-3 py-1.5 rounded-xl">👁️ View Only</span>}
        </div>
      </div>

      {/* Project Header */}
      {project && (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/80 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{project.name}</h1>
          <p className="text-slate-500 text-base max-w-2xl leading-relaxed">{project.description || 'Aucune description supplémentaire pour ce projet pour le moment.'}</p>
        </div>
      )}

      {/* Barre de statistiques et progression en direct */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg shadow-indigo-500/5 border border-white/80 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Progression du projet
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-black text-indigo-600">{progressPercentage}%</span>
              <span className="text-xs text-slate-500 font-medium">
                ({completedTasks} sur {totalTasks} tâches terminées)
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial bg-slate-100/80 px-4 py-2.5 rounded-2xl text-center border border-slate-200/50">
              <span className="block text-[10px] font-extrabold uppercase text-slate-500">📌 To Do</span>
              <span className="text-lg font-black text-slate-700">{todoTasks}</span>
            </div>
            <div className="flex-1 md:flex-initial bg-indigo-50 px-4 py-2.5 rounded-2xl text-center border border-indigo-100/50">
              <span className="block text-[10px] font-extrabold uppercase text-indigo-500">⏳ In Progress</span>
              <span className="text-lg font-black text-indigo-700">{inProgressTasks}</span>
            </div>
            <div className="flex-1 md:flex-initial bg-emerald-50 px-4 py-2.5 rounded-2xl text-center border border-emerald-100/50">
              <span className="block text-[10px] font-extrabold uppercase text-emerald-500">✅ Done</span>
              <span className="text-lg font-black text-emerald-700">{completedTasks}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Formulaire de création de tâche - Affiché uniquement pour les rôles autorisés (Admin / Member) */}
      {canEdit && (
        <form onSubmit={handleCreateTask} className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100/80 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-indigo-600 rounded-full"></span>
            {t('projects.createTitle')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('projects.nameLabel')}</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/55 transition-all"
                placeholder={t('projects.namePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Assigné à
              </label>
              <input
                type="text"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/55 transition-all"
                placeholder="Nom ou Email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Date d&apos;échéance
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/55 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Priorité
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/55 transition-all cursor-pointer"
              >
                <option value="low">🌱 Basse</option>
                <option value="medium">⚡ Moyenne</option>
                <option value="high">🔥 Haute</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              🏷️ Labels (séparés par une virgule)
            </label>
            <input
              type="text"
              value={taskLabels}
              onChange={(e) => setTaskLabels(e.target.value)}
              className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/55 transition-all"
              placeholder="e.g. Frontend, UI/UX, Bug"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('projects.descLabel')}</label>
            <textarea
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/55 transition-all"
              placeholder={t('projects.descPlaceholder')}
              rows={2}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-7 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? t('projects.loading') : `✨ ${t('projects.submitBtn')}`}
          </button>
        </form>
      )}

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une tâche, un responsable ou un label..."
            className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'todo', 'in_progress', 'done'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-3 text-xs font-bold rounded-2xl transition-all shadow-sm ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-slate-900/20 scale-105'
                  : 'bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'all' && '🌌 Tous'}
              {status === 'todo' && '📌 To Do'}
              {status === 'in_progress' && '⏳ In Progress'}
              {status === 'done' && '✅ Done'}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {columns.map((col) => (
            <Droppable key={col.id} droppableId={col.id} isDropDisabled={!canEdit}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-5 rounded-3xl border transition-all duration-300 ${
                    snapshot.isDraggingOver 
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-xl shadow-indigo-500/10 ring-4 ring-indigo-500/5' 
                      : 'bg-white/60 backdrop-blur-xl border-slate-200/80 shadow-sm'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${col.headerColor} mb-4 flex justify-between items-center font-extrabold text-sm shadow-sm`}>
                    <span>{col.title}</span>
                    <span className="bg-white text-slate-700 text-xs px-2.5 py-1 rounded-xl shadow-xs font-mono">{col.tasks.length}</span>
                  </div>

                  <div className="space-y-3.5 min-h-[250px]">
                    {col.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={index} isDragDisabled={!canEdit}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                            onClick={() => openTaskModal(task)}
                            className={`bg-white p-5 rounded-2xl border transition-all duration-200 relative group cursor-pointer ${
                              snapshot.isDragging 
                                ? 'shadow-2xl border-indigo-400 rotate-2 scale-105 z-50 bg-indigo-50/30' 
                                : 'shadow-sm hover:shadow-xl hover:border-indigo-200 border-slate-100'
                            } ${task.status === 'done' ? 'opacity-75 bg-slate-50/80' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-3 mb-2.5">
                              <h4 className={`font-bold text-sm leading-snug ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {task.title}
                              </h4>
                              {/* Option de suppression réservée exclusivement à l'Admin */}
                              {isAdmin && (
                                <button
                                  onClick={(e) => handleDeleteTask(task.id, e)}
                                  className="text-slate-300 hover:text-rose-600 text-xs transition-colors p-1 rounded-lg hover:bg-rose-50"
                                  title="Supprimer la tâche (Admin Uniquement)"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                            
                            <p className="text-slate-500 text-xs mb-3 leading-relaxed line-clamp-2">{task.description || '---'}</p>

                            {/* Labels personnalisés */}
                            {task.labels && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {task.labels.split(',').map((label, i) => (
                                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-semibold">
                                    🏷️ {label.trim()}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Badge du membre assigné */}
                            {task.assigned_to && (
                              <div className="mb-3 flex items-center gap-1.5 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-xl w-fit">
                                <span className="text-[11px] font-bold text-indigo-700">👤 {task.assigned_to}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getPriorityBadge(task.priority)}
                                {task.due_date && (
                                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                    📅 {task.due_date}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-indigo-500 font-semibold hover:underline">💬 Détails →</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {col.tasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200/60 rounded-2xl">
                        <span className="text-2xl mb-1">📂</span>
                        <p className="text-xs italic">{t('projects.noTasks')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Task Modal - Modale de détails de la tâche et des commentaires */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 relative overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getPriorityBadge(selectedTask.priority)}
                  <span className="text-xs font-bold text-slate-400 font-mono">ID: #{selectedTask.id}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">{selectedTask.title}</h2>
              </div>
              <button
                onClick={closeTaskModal}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto space-y-6 pr-2 flex-1">
              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-1">📌 Statut</span>
                  <span className="font-extrabold text-indigo-600 uppercase">{selectedTask.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-1">👤 Assigné à</span>
                  <span className="font-bold text-slate-700">{selectedTask.assigned_to || '---'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-1">📅 Échéance</span>
                  <span className="font-bold text-slate-700">{selectedTask.due_date || '---'}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">📝 Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                  {selectedTask.description || 'Aucune description fournie.'}
                </p>
              </div>

              {/* Labels */}
              {selectedTask.labels && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">🏷️ Labels</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.labels.split(',').map((label, i) => (
                      <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-xl font-bold">
                        {label.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Section des commentaires */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <span>💬</span> Commentaires et discussions
                  <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{comments.length}</span>
                </h3>

                {/* Liste des commentaires */}
                <div className="space-y-3 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-indigo-600">{c.user_name}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-xs italic text-slate-400 text-center py-4">
                      Aucun commentaire pour le moment. Soyez le premier à commenter !
                    </p>
                  )}
                </div>

                {/* Formulaire d'ajout de commentaire - Masqué pour le rôle Viewer */}
                {!isViewer && (
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <input
                      type="text"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Votre nom (optionnel)"
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Écrire un commentaire..."
                        className="flex-1 p-3 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/55"
                        required
                      />
                      <button
                        type="submit"
                        disabled={commentLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl text-xs transition shadow-md shadow-indigo-500/20"
                      >
                        {commentLoading ? '...' : 'Envoyer'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function ProjectDetailsPage({ params }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Chargement du chef-d&apos;œuvre... ✨</div>}>
      <ProjectContent params={params} />
    </Suspense>
  )
}