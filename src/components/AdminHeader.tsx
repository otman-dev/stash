"use client"
import React, { useState } from 'react'
import Logo from './Logo'
import { useAuth } from '@/lib/client-auth'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/products', label: 'All Products' },
  { href: '/admin/categories', label: 'All Categories' },
]

export default function AdminHeader() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A'
  
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
            <div className="text-xl font-bold text-blue-600">Stash Admin</div>
            <div className="text-xs text-slate-500">Administration Panel</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 bg-blue-600 text-white px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="hidden sm:inline">User Dashboard</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            {user?.image ? (
              <Image 
                src={user.image} 
                alt={user.name || 'Admin'} 
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
              {user?.name || 'Admin'}
            </div>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          {/* Mobile user info */}
          <div className="px-4 py-3 border-t border-slate-200 flex items-center gap-3">
            {user?.image ? (
              <Image 
                src={user.image} 
                alt={user.name || 'Admin'} 
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
              <div className="text-sm font-medium text-slate-700">{user?.name || 'Admin'}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
