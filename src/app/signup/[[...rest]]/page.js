'use client'

import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50/50 px-4 py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[30rem] rounded-full bg-violet-200/30 blur-3xl" />
      <div className="relative flex w-full max-w-md flex-col items-center gap-6">
        <Link href="/login" className="flex items-center justify-center no-underline">
          <Image
            src="/devcollab-logo.png"
            alt="DevCollab"
            width={629}
            height={347}
            priority
            className="h-auto w-44 max-w-[70vw] sm:w-52"
          />
        </Link>
        <SignUp
          path="/signup"
          routing="path"
          signInUrl="/login"
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
