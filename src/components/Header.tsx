"use client"
import React from 'react'
import Logo from './Logo'
import { useState } from 'react'
import { useAuth } from '@/lib/client-auth'
import { useLanguage } from '@/i18n/LanguageContext'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', exact: true },
  { href: '/dashboard/categories', label: 'Categories', exact: false },
  { href: '/dashboard/products', label: 'Products', exact: false },
]

export default function Header() {
  const [q, setQ] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'
  
  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    return pathname?.startsWith(href)
  }
  
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-20">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          <Logo className="h-10 w-10" />
          <div className="hidden sm:block">
            <div className="text-xl font-bold text-blue-600">{t('common.stash')}</div>
            <div className="text-xs text-slate-500">{t('common.tagline')}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - hidden on mobile, show in mobile menu */}
          <div className="hidden md:block relative w-80 group">
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
          
          {isAdmin && (
            <Link 
              href="/admin" 
              className="flex items-center gap-2 bg-blue-600 text-white px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
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
            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">{t('auth.logout')}</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          {/* Mobile search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative w-full group">
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
          </div>
          
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href, item.exact)
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Mobile user info */}
          <div className="px-4 py-3 border-t border-slate-200 flex items-center gap-3">
            {user?.image ? (
              <Image 
                src={user.image} 
                alt={user.name || 'User'} 
                width={40} 
                height={40} 
                className="rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium">
                {userInitial}
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-slate-700">{user?.name || t('common.user')}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
          </div>
          
          {/* Mobile help section */}
          <div className="p-4 border-t border-slate-200">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Need help?</h3>
              <p className="text-xs text-blue-600 mb-3">Check our documentation for tips and tutorials.</p>
              <a href="#" className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center">
                View Documentation
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
