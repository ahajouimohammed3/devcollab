'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { ArrowUpRight, BriefcaseBusiness, LoaderCircle, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/context/LanguageContext'

const pageText = {
  fr: {
    title: 'Espaces de travail',
    subtitle: 'Gérez vos projets et votre équipe',
    createTitle: 'Créer un nouvel espace',
    createHint: 'Un espace dédié pour rassembler votre équipe et vos projets.',
    name: "Nom de l'espace",
    namePlaceholder: 'Ex. Équipe marketing',
    description: 'Description',
    descriptionPlaceholder: 'À quoi servira cet espace ?',
    add: 'Ajouter',
    adding: 'Création...',
    yourWorkspaces: 'Vos espaces',
    workspaceCount: (count) => `${count} ${count > 1 ? 'espaces' : 'espace'}`,
    emptyTitle: 'Aucun espace pour le moment',
    emptyDescription: 'Créez votre premier espace pour commencer à organiser vos projets.',
    noDescription: 'Aucune description',
    open: "Ouvrir l'espace",
    delete: "Supprimer l'espace",
    loading: 'Chargement de vos espaces...',
    loadError: 'Impossible de charger vos espaces. Réessayez dans un instant.',
    createError: "Impossible de créer l'espace. Réessayez.",
    deleteError: "Impossible de supprimer cet espace. Réessayez.",
  },
  en: {
    title: 'Workspaces',
    subtitle: 'Manage your projects and team',
    createTitle: 'Create a new workspace',
    createHint: 'A dedicated place to bring your team and projects together.',
    name: 'Workspace name',
    namePlaceholder: 'e.g. Marketing team',
    description: 'Description',
    descriptionPlaceholder: 'What is this workspace for?',
    add: 'Create workspace',
    adding: 'Creating...',
    yourWorkspaces: 'Your workspaces',
    workspaceCount: (count) => `${count} ${count === 1 ? 'workspace' : 'workspaces'}`,
    emptyTitle: 'No workspaces yet',
    emptyDescription: 'Create your first workspace to start organizing your projects.',
    noDescription: 'No description provided',
    open: 'Open workspace',
    delete: 'Delete workspace',
    loading: 'Loading your workspaces...',
    loadError: 'Could not load your workspaces. Please try again.',
    createError: 'Could not create the workspace. Please try again.',
    deleteError: 'Could not delete this workspace. Please try again.',
  },
  ar: {
    title: 'مساحات العمل',
    subtitle: 'أدر مشاريعك وفريقك',
    createTitle: 'إنشاء مساحة عمل جديدة',
    createHint: 'مساحة مخصصة لجمع فريقك ومشاريعك في مكان واحد.',
    name: 'اسم مساحة العمل',
    namePlaceholder: 'مثال: فريق التسويق',
    description: 'الوصف',
    descriptionPlaceholder: 'ما الغرض من مساحة العمل؟',
    add: 'إنشاء مساحة العمل',
    adding: 'جارٍ الإنشاء...',
    yourWorkspaces: 'مساحات العمل الخاصة بك',
    workspaceCount: (count) => `${count} مساحة`,
    emptyTitle: 'لا توجد مساحات عمل بعد',
    emptyDescription: 'أنشئ مساحة العمل الأولى للبدء في تنظيم مشاريعك.',
    noDescription: 'لا يوجد وصف',
    open: 'فتح مساحة العمل',
    delete: 'حذف مساحة العمل',
    loading: 'جارٍ تحميل مساحات العمل...',
    loadError: 'تعذر تحميل مساحات العمل. يرجى المحاولة مرة أخرى.',
    createError: 'تعذر إنشاء مساحة العمل. يرجى المحاولة مرة أخرى.',
    deleteError: 'تعذر حذف مساحة العمل. يرجى المحاولة مرة أخرى.',
  },
}

export default function WorkspacesPage() {
  const { locale } = useTranslation()
  const { isLoaded, user } = useUser()
  const copy = pageText[locale] || pageText.fr
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const userId = user?.id

  const [workspaces, setWorkspaces] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    if (!isLoaded || !userId) return

    let cancelled = false

    const loadWorkspaces = async () => {
      try {
        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .eq('user_id', userId)

        if (cancelled) return

        if (error) {
          console.error('Error fetching workspaces:', error.message)
          setPageError(copy.loadError)
        } else {
          setWorkspaces(data || [])
        }
      } catch (error) {
        if (cancelled) return
        console.error('Error fetching workspaces:', error)
        setPageError(copy.loadError)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadWorkspaces()

    return () => {
      cancelled = true
    }
  }, [copy.loadError, isLoaded, userId])

  const refreshWorkspaces = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching workspaces:', error.message)
        setPageError(copy.loadError)
        return
      }

      setWorkspaces(data || [])
    } catch (error) {
      console.error('Error fetching workspaces:', error)
      setPageError(copy.loadError)
    }
  }

  const handleCreateWorkspace = async (event) => {
    event.preventDefault()
    const workspaceName = name.trim()

    if (!workspaceName || !userId) return

    setIsSubmitting(true)
    setPageError('')

    try {
      const { error } = await supabase.from('workspaces').insert([
        {
          name: workspaceName,
          description: description.trim(),
          user_id: userId,
        },
      ])

      if (error) {
        console.error('Error creating workspace:', error.message)
        setPageError(copy.createError)
        return
      }

      setName('')
      setDescription('')
      await refreshWorkspaces()
    } catch (error) {
      console.error('Error creating workspace:', error)
      setPageError(copy.createError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteWorkspace = async (id) => {
    setDeletingId(id)
    setPageError('')

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting workspace:', error.message)
        setPageError(copy.deleteError)
        return
      }

      await refreshWorkspaces()
    } catch (error) {
      console.error('Error deleting workspace:', error)
      setPageError(copy.deleteError)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="workspace-page" dir={direction}>
      <style jsx>{`
        .workspace-page {
          min-height: 100vh;
          box-sizing: border-box;
          padding: 56px 24px 80px;
          background:
            radial-gradient(ellipse at 10% 0%, rgba(224, 231, 255, 0.6), transparent 34rem),
            #f8fafc;
          color: #0f172a;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .workspace-container {
          width: min(100%, 1000px);
          margin-inline: auto;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px;
          color: #4f46e5;
          font-size: 0.78rem;
          font-weight: 750;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .eyebrow-mark {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6366f1;
        }

        h1 {
          margin: 0;
          color: #111827;
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 780;
          letter-spacing: -0.045em;
          line-height: 1.15;
          text-wrap: balance;
        }

        .page-subtitle {
          margin: 12px 0 0;
          color: #64748b;
          font-size: 1rem;
          line-height: 1.7;
        }

        .create-card {
          margin-bottom: 40px;
          padding: 28px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.94);
        }

        .section-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 24px;
        }

        .section-icon,
        .workspace-icon {
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          color: #4f46e5;
          background: #eef2ff;
        }

        .section-icon {
          width: 44px;
          height: 44px;
          border-radius: 8px;
        }

        .section-heading h2,
        .list-heading h2 {
          margin: 0;
          color: #172033;
          font-size: 1.12rem;
          font-weight: 730;
          letter-spacing: -0.025em;
          line-height: 1.4;
        }

        .section-heading p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.55;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .field {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          color: #334155;
          font-size: 0.86rem;
          font-weight: 650;
        }

        .field input {
          box-sizing: border-box;
          width: 100%;
          min-height: 48px;
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #0f172a;
          font: inherit;
          font-size: 0.94rem;
          text-align: start;
          transition: border-color 160ms ease, background 160ms ease;
        }

        .field input::placeholder {
          color: #94a3b8;
        }

        .field input:hover {
          border-color: #94a3b8;
        }

        .field input:focus {
          border-color: #6366f1;
          background: #fff;
          outline: 2px solid rgba(99, 102, 241, 0.28);
          outline-offset: 1px;
        }

        .form-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .primary-button {
          display: inline-flex;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 19px;
          border: 1px solid #4f46e5;
          border-radius: 8px;
          background: #4f46e5;
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 0.9rem;
          font-weight: 700;
          transition: transform 160ms ease, background 160ms ease;
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #4338ca;
        }

        .primary-button:focus-visible,
        .delete-button:focus-visible,
        .workspace-link:focus-visible {
          outline: 3px solid rgba(99, 102, 241, 0.45);
          outline-offset: 3px;
        }

        .primary-button:disabled,
        .delete-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .list-section {
          margin-top: 0;
        }

        .list-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .list-heading h2 {
          font-size: 1.3rem;
        }

        .count-badge {
          display: inline-flex;
          min-height: 28px;
          align-items: center;
          padding: 0 11px;
          border: 1px solid #e0e7ff;
          border-radius: 999px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
          gap: 16px;
        }

        .workspace-card {
          min-width: 0;
          padding: 21px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
          transition: transform 180ms ease, border-color 180ms ease;
        }

        .workspace-card:hover {
          transform: translateY(-3px);
          border-color: #c7d2fe;
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .workspace-icon {
          width: 42px;
          height: 42px;
          border-radius: 8px;
        }

        .delete-button {
          display: grid;
          width: 36px;
          height: 36px;
          flex: 0 0 auto;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
        }

        .delete-button:hover:not(:disabled) {
          border-color: #fee2e2;
          background: #fff1f2;
          color: #e11d48;
        }

        .workspace-link {
          display: inline-block;
          max-width: 100%;
          color: #172033;
          text-decoration: none;
          overflow-wrap: anywhere;
        }

        .workspace-link:hover {
          color: #4f46e5;
        }

        .workspace-link h3 {
          margin: 0;
          font-size: 1.02rem;
          font-weight: 720;
          letter-spacing: -0.02em;
          line-height: 1.5;
        }

        .card-description {
          display: -webkit-box;
          min-height: 44px;
          margin: 8px 0 18px;
          overflow: hidden;
          color: #64748b;
          font-size: 0.88rem;
          line-height: 1.65;
          overflow-wrap: anywhere;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
          color: #6366f1;
          font-size: 0.8rem;
          font-weight: 680;
        }

        .open-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .empty-state,
        .loading-state {
          display: flex;
          min-height: 220px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.65);
          text-align: center;
        }

        .empty-icon {
          display: grid;
          width: 52px;
          height: 52px;
          margin-bottom: 14px;
          place-items: center;
          border-radius: 8px;
          background: #eef2ff;
          color: #6366f1;
        }

        .empty-state h3 {
          margin: 0;
          color: #1e293b;
          font-size: 1rem;
          font-weight: 700;
        }

        .empty-state p,
        .loading-state span {
          max-width: 390px;
          margin: 7px 0 0;
          color: #64748b;
          font-size: 0.88rem;
          line-height: 1.65;
        }

        .loading-state {
          gap: 12px;
          color: #6366f1;
        }

        .loading-state span {
          margin: 0;
        }

        .status-message {
          margin: 0 0 22px;
          padding: 12px 15px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 0.88rem;
          line-height: 1.5;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .spinner {
          animation: spin 900ms linear infinite;
        }

        @media (max-width: 640px) {
          .workspace-page {
            padding: 34px 16px 56px;
          }

          .page-header {
            margin-bottom: 24px;
          }

          .create-card {
            margin-bottom: 32px;
            padding: 21px 18px;
            border-radius: 8px;
          }

          .form-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 15px;
          }

          .form-footer,
          .primary-button {
            width: 100%;
          }

          .workspace-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="workspace-container">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true" />
              DevCollab
            </p>
            <h1>{copy.title}</h1>
            <p className="page-subtitle">{copy.subtitle}</p>
          </div>
        </header>

        <section className="create-card" aria-labelledby="create-workspace-title">
          <div className="section-heading">
            <div className="section-icon" aria-hidden="true">
              <BriefcaseBusiness size={21} />
            </div>
            <div>
              <h2 id="create-workspace-title">{copy.createTitle}</h2>
              <p>{copy.createHint}</p>
            </div>
          </div>

          <form onSubmit={handleCreateWorkspace}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="workspace-name">{copy.name}</label>
                <input
                  id="workspace-name"
                  type="text"
                  dir="auto"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={copy.namePlaceholder}
                  autoComplete="organization"
                  maxLength={100}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="workspace-description">{copy.description}</label>
                <input
                  id="workspace-description"
                  type="text"
                  dir="auto"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={copy.descriptionPlaceholder}
                  maxLength={240}
                />
              </div>
            </div>
            <div className="form-footer">
              <button className="primary-button" type="submit" disabled={isSubmitting || !userId}>
                {isSubmitting ? (
                  <LoaderCircle className="spinner" size={18} aria-hidden="true" />
                ) : (
                  <Plus size={18} aria-hidden="true" />
                )}
                {isSubmitting ? copy.adding : copy.add}
              </button>
            </div>
          </form>
        </section>

        {pageError && (
          <p className="status-message" role="alert">
            {pageError}
          </p>
        )}

        <section className="list-section" aria-labelledby="workspace-list-title">
          <div className="list-heading">
            <h2 id="workspace-list-title">{copy.yourWorkspaces}</h2>
            <span className="count-badge">{copy.workspaceCount(workspaces.length)}</span>
          </div>

          {isLoading ? (
            <div className="loading-state" role="status">
              <LoaderCircle className="spinner" size={24} aria-hidden="true" />
              <span>{copy.loading}</span>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                <BriefcaseBusiness size={24} />
              </div>
              <h3>{copy.emptyTitle}</h3>
              <p>{copy.emptyDescription}</p>
            </div>
          ) : (
            <div className="workspace-grid">
              {workspaces.map((workspace) => (
                <article className="workspace-card" key={workspace.id}>
                  <div className="card-top">
                    <div className="workspace-icon" aria-hidden="true">
                      <BriefcaseBusiness size={20} />
                    </div>
                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => handleDeleteWorkspace(workspace.id)}
                      disabled={deletingId === workspace.id}
                      aria-label={copy.delete}
                      title={copy.delete}
                    >
                      {deletingId === workspace.id ? (
                        <LoaderCircle className="spinner" size={18} aria-hidden="true" />
                      ) : (
                        <Trash2 size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <Link
                    className="workspace-link"
                    href={`/workspaces/${workspace.id}`}
                    dir="auto"
                  >
                    <h3>{workspace.name}</h3>
                  </Link>
                  <p className="card-description" dir="auto">
                    {workspace.description || copy.noDescription}
                  </p>

                  <div className="card-footer">
                    <span className="open-label">
                      {copy.open}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </span>
                    <BriefcaseBusiness size={16} aria-hidden="true" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
