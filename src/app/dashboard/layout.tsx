"use client"
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { ToastProvider } from '@/components/ToastContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex flex-1">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <main className="flex-1 p-6 bg-slate-50 overflow-y-auto">
              <div className="max-w-7xl mx-auto py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </AuthGuard>
  )
}
