'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  // 🛡️ Utilisation correcte du hook useSignIn de Clerk
  const { isLoaded, signIn, setActive } = useSignIn()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  // Gestion de la soumission du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setError('')

    try {
      // Tentative de connexion avec Clerk
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        // Activation de la session utilisateur
        await setActive({ session: result.createdSessionId })
        router.push('/')
      } else {
        console.log('Statut de connexion:', result)
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
      setError(err.errors?.[0]?.message || 'Une erreur est survenue lors de la connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 p-4 font-sans">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/80 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Connexion</h1>
          <p className="text-sm text-slate-500">Accédez à votre espace de travail DevCollab</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-2xl font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Adresse Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/50 transition-all"
              placeholder="nom@exemple.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold p-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 mt-2"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Vous n'avez pas de compte ?{' '}
          <Link href="/signup" className="text-indigo-600 font-bold hover:underline">
            S'inscrire
          </Link>
        </div>
      </div>
    </main>
  )
}