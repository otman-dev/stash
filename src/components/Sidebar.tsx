"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const path = usePathname()
  const isActive = (p: string) => path?.startsWith(p) && (p === '/dashboard' ? path === '/dashboard' : true)
  
  return (
    <aside className="w-72 min-h-screen bg-white border-r shadow-sm">
      <div className="sticky top-0 overflow-y-auto h-screen pt-5 pb-12">
        <div className="px-6 mb-8 hidden lg:block">
          <div className="text-blue-600 font-bold text-2xl mb-1">Stash</div>
          <div className="text-xs text-slate-500">Inventory Management</div>
        </div>
        
        <nav className="px-3 space-y-1">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/dashboard') 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Dashboard</span>
          </Link>
          
          <Link 
            href="/dashboard/categories" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/dashboard/categories') 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>Categories</span>
          </Link>
          
          <Link 
            href="/dashboard/products" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/dashboard/products') 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            <span>Products</span>
          </Link>
        </nav>
        
        <div className="px-6 mt-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Need help?</h3>
            <p className="text-xs text-blue-600 mb-3">Check our documentation for tips and tutorials.</p>
            <a href="https://github.com/otman-dev/stash/blob/master/docs/USER_GUIDE.md" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center">
              View Documentation
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
