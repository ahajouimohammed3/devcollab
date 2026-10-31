'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50/50 px-4 py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[30rem] rounded-full bg-violet-200/30 blur-3xl" />
      <div className="relative flex w-full max-w-md flex-col items-center gap-6">
        <Link href="/login" className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-slate-900 no-underline">
          <span className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-700 text-sm text-white">
            D
          </span>
          <span>Dev<span className="text-indigo-600">Collab</span></span>
        </Link>
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/signup"
          forceRedirectUrl="/workspaces"
          appearance={{
            elements: {
              card: 'rounded-lg border border-white/80',
              headerTitle: 'font-bold tracking-tight text-slate-900',
              headerSubtitle: 'text-slate-500',
              formButtonPrimary: 'font-semibold',
            },
          }}
        />
      </div>
    </main>
  )
}
