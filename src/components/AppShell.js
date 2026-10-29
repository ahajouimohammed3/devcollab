'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function AppShell({ children }) {
  const pathname = usePathname()
  const isAuthRoute = pathname === '/login' || pathname.startsWith('/login/') ||
    pathname === '/signup' || pathname.startsWith('/signup/')

  if (isAuthRoute) return children

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <div className="app-content">{children}</div>
      </div>
    </div>
  )
}
