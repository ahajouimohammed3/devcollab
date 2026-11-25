'use client'

import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="login-page-background relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      <div className="relative flex w-full max-w-md flex-col items-center gap-7 sm:gap-8">
        <Link href="/login" className="flex items-center justify-center no-underline">
          <Image
            src="/devcollab-logo-transparent.png"
            alt="DevCollab"
            width={629}
            height={347}
            priority
            className="h-auto w-56 max-w-[82vw] sm:w-64"
          />
        </Link>
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/signup"
          forceRedirectUrl="/workspaces"
          appearance={{
            elements: {
              card: 'rounded-2xl border border-white/80 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur-xl',
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
