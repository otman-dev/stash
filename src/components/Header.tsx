"use client"
import React from 'react'
import Logo from './Logo'
import { useState } from 'react'
import { useAuth } from '@/lib/client-auth'
import { useLanguage } from '@/i18n/LanguageContext'
import Image from 'next/image'

export default function Header() {
  const [q, setQ] = useState('')
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'
  
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Logo className="h-10 w-10" />
        <div>
          <div className="text-xl font-bold text-blue-600">{t('common.stash')}</div>
          <div className="text-xs text-slate-500">{t('common.tagline')}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            aria-label={t('common.searchProducts')}
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder={t('common.searchProducts')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors" 
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {user?.image ? (
              <Image 
                src={user.image} 
                alt={user.name || 'User'} 
                width={36} 
                height={36} 
                className="rounded-full w-9 h-9 object-cover border border-gray-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium shadow-sm">
                {userInitial}
              </div>
            )}
            <div className="text-sm font-medium text-slate-700">
              {user?.name || t('common.user')}
            </div>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
