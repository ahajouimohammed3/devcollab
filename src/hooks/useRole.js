'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

export function useRole(workspaceId) {
  const { user } = useUser()
  const [role, setRole] = useState('viewer') // Le rôle par défaut est celui du spectateur pour garantir la sécurité
  const [loadingRole, setLoadingRole] = useState(true)

  useEffect(() => {
    async function fetchUserRole() {
      if (!user || !workspaceId) {
        setLoadingRole(false)
        return
      }

      const { data, error } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

      if (data && !error) {
        setRole(data.role)
      } else {
        // Si l'utilisateur a créé l'espace de travail, nous le considérons automatiquement comme administrateur
        setRole('admin')
      }
      setLoadingRole(false)
    }

    fetchUserRole()
  }, [user, workspaceId])

  return {
    role,
    loadingRole,
    isAdmin: role === 'admin',
    canEdit: role === 'admin' || role === 'member',
    isViewer: role === 'viewer'
  }
}