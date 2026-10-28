'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  // 🛡️ Utilisation correcte du hook useSignUp de Clerk
  const { isLoaded, signUp, setActive } = useSignUp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  // Soumission initiale pour la création de compte
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setError('')

    try {
      await signUp.create({
        emailAddress: email,
        password,
      })

      // Envoi du code de vérification par email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err) {
      console.error('Erreur lors de l inscription:', err)
      setError(err.errors?.[0]?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  // Vérification du code reçu par email
  const handleVerify = async (e) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setError('')

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.push('/')
      } else {
        console.log('Résultat vérification:', completeSignUp)
      }
    } catch (err) {
      console.error('Erreur de vérification:', err)
      setError(err.errors?.[0]?.message || 'Code de vérification invalide.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 p-4 font-sans">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/80 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Inscription</h1>
          <p className="text-sm text-slate-500">Rejoignez DevCollab et commencez à collaborer</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-2xl font-semibold">
            ⚠️ {error}
          </div>
        )}

        {!pendingVerification ? (
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
              {loading ? 'Création du compte...' : "S'inscrire"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-indigo-700 mb-4">
              📩 Un code de vérification a été envoyé à votre adresse email.
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Code de vérification
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/50 transition-all text-center tracking-widest font-mono text-lg"
                placeholder="123456"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold p-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 mt-2"
            >
              {loading ? 'Vérification...' : 'Confirmer le code'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  )
}