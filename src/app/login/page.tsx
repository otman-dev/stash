"use client"
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Logo from '@/components/Logo'
import { useLanguage } from '@/i18n/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function LoginPage() {
  const { t, dir } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', { 
        email, 
        password, 
        redirect: false 
      })
      
      if (result?.error) {
        setErr(result.error || 'Login failed')
      } else {
        // Get redirect path from localStorage or default to dashboard
        const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard'
        localStorage.removeItem('redirectAfterLogin') // Clear stored path
        router.push(redirectPath)
      }
    } catch (error) {
      setErr('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsGoogleLoading(true)
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      setErr('Error signing in with Google')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div dir={dir} className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Left panel with decorative content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-800 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 0 L100 100 Z" fill="currentColor" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <Logo className="w-12 h-12" />
            <div className="text-white">
              <div className="text-2xl font-bold">{t('common.stash')}</div>
              <div className="text-sm opacity-80">{t('common.tagline')}</div>
            </div>
          </div>
          
          <div className="mt-auto">
            <h1 className="text-4xl font-bold text-white mb-6">{t('auth.loginSubtitle')}</h1>
            <p className="text-blue-100 text-xl">{t('home.hero.description')}</p>
          </div>
        </div>
        
        <div className="relative z-10 text-blue-100 text-sm">
          &copy; 2025 {t('common.stash')}. {t('home.footer.allRightsReserved')}
        </div>
      </div>
      
      {/* Right panel with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <div className="text-xl font-bold text-blue-600">{t('common.stash')}</div>
                <div className="text-xs text-slate-500">{t('common.tagline')}</div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('auth.loginTitle')}</h2>
            <p className="text-slate-500 mb-6">{t('auth.loginSubtitle')}</p>
            
            {err && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{err}</span>
              </div>
            )}
            
            <button 
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full mb-6 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all flex items-center justify-center"
            >
              {isGoogleLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">or continue with</span>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.emailAddress')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors" 
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">{t('auth.password')}</label>
                  <a href="#" className="text-xs text-blue-600 hover:text-blue-800 transition-colors">{t('auth.forgotPassword')}</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('auth.signingIn')}
                    </>
                  ) : t('auth.loginTitle')}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-slate-500">
              {t('auth.noAccount')} <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">{t('auth.registerNow')}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
