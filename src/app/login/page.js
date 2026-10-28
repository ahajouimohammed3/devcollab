'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) throw error
        alert('تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني إن تطلب الأمر.')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        router.push('/workspaces')
      }
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">DevCollab</h1>
          <p className="text-gray-500 text-sm mt-2">
            {isSignUp ? 'أنشئ حسابك الجديد للبدء' : 'مرحباً بك مجدداً! سجل دخولك للمتابعة'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'جاري المعالجة...' : isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          {isSignUp ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب؟ '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </button>
        </div>
      </div>
    </div>
  )
}