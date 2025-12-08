"use client"
import React from 'react'
import Logo from './Logo'
import { useAuth } from '@/lib/client-auth'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminHeader() {
  const { user, logout } = useAuth()
  
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A'
  
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gradient-to-r from-purple-700 to-purple-900 border-b shadow-lg sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Logo className="h-10 w-10" />
        <div>
          <div className="text-xl font-bold text-white">Stash Admin</div>
          <div className="text-xs text-purple-200">Administration Panel</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-500 transition-colors font-medium text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          User Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {user?.image ? (
              <Image 
                src={user.image} 
                alt={user.name || 'Admin'} 
                width={36} 
                height={36} 
                className="rounded-full w-9 h-9 object-cover border-2 border-purple-300"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-purple-700 font-medium shadow-sm">
                {userInitial}
              </div>
            )}
            <div className="text-sm font-medium text-white">
              {user?.name || 'Admin'}
            </div>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
