"use client"
import AdminGuard from '@/components/AdminGuard'
import AdminHeader from '@/components/AdminHeader'
import AdminSidebar from '@/components/AdminSidebar'
import { ToastProvider } from '@/components/ToastContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-slate-100">
          <AdminHeader />
          <div className="flex flex-1">
            <div className="hidden md:block">
              <AdminSidebar />
            </div>
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </AdminGuard>
  )
}
