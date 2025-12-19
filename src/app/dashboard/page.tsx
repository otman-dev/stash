"use client"
import { useState, useMemo } from 'react'
import useSWR from '../../lib/swrClient'
import { motion } from 'framer-motion'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

// Helper function to check if a date is within a time range
function isWithinRange(dateString: string | undefined, range: 'week' | 'month' | 'year'): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  switch (range) {
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }
    case 'month': {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return date >= monthAgo;
    }
    case 'year': {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return date >= yearStart;
    }
    default:
      return false;
  }
}

export default function DashboardPage() {
  const { data: products, error: productsError, isLoading: productsLoading } = useSWR('/api/products', fetcher)
  const { data: categories, error: categoriesError, isLoading: categoriesLoading } = useSWR('/api/categories', fetcher)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week')

  const isLoading = productsLoading || categoriesLoading

  // Calculate items added within the selected date range
  const itemsAddedInRange = useMemo(() => {
    if (!products || !Array.isArray(products)) return 0;
    return products.filter((p: any) => isWithinRange(p.createdAt, dateRange)).length;
  }, [products, dateRange]);

  // Calculate categories added within the selected date range
  const categoriesAddedInRange = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return 0;
    return categories.filter((c: any) => isWithinRange(c.createdAt, dateRange)).length;
  }, [categories, dateRange]);

  // Total new items (products + categories) in range
  const totalNewItems = itemsAddedInRange + categoriesAddedInRange;

  return (
    <div>
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-slate-800">Dashboard Overview</h1>
            <p className="text-slate-500">Welcome back! Here's what's happening with your inventory today.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDateRange('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                dateRange === 'week' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              This Week
            </button>
            <button 
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                dateRange === 'month' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              This Month
            </button>
            <button 
              onClick={() => setDateRange('year')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                dateRange === 'year' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              This Year
            </button>
          </div>
        </div>
      </motion.section>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div 
          variants={item}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m8 4v10" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Products</p>
            <p className="text-4xl font-bold mt-2 mb-2">
              {isLoading ? (
                <span className="inline-block w-16 h-9 bg-white/20 animate-pulse rounded"></span>
              ) : (
                products?.length || 0
              )}
            </p>
            <div className="flex items-center text-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">
                {itemsAddedInRange > 0 ? `+${itemsAddedInRange} this ${dateRange}` : 'All time'}
              </span>
            </div>
          </div>
          <Link href="/dashboard/products" className="absolute inset-0 focus:outline-none" aria-label="View all products">
            <span className="sr-only">View all products</span>
          </Link>
        </motion.div>

        <motion.div 
          variants={item}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Categories</p>
            <p className="text-4xl font-bold mt-2 mb-2">
              {isLoading ? (
                <span className="inline-block w-16 h-9 bg-white/20 animate-pulse rounded"></span>
              ) : (
                categories?.length || 0
              )}
            </p>
            <div className="flex items-center text-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span className="text-xs font-medium">
                {categoriesAddedInRange > 0 ? `+${categoriesAddedInRange} this ${dateRange}` : 'All time'}
              </span>
            </div>
          </div>
          <Link href="/dashboard/categories" className="absolute inset-0 focus:outline-none" aria-label="View all categories">
            <span className="sr-only">View all categories</span>
          </Link>
        </motion.div>
        
        <motion.div 
          variants={item}
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-amber-100 text-sm font-medium uppercase tracking-wide">Total Units</p>
            <p className="text-4xl font-bold mt-2 mb-2">
              {isLoading ? (
                <span className="inline-block w-16 h-9 bg-white/20 animate-pulse rounded"></span>
              ) : (
                products?.reduce((sum: number, p: any) => sum + (p.units || 0), 0) || 0
              )}
            </p>
            <div className="flex items-center text-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="text-xs font-medium">In stock across all products</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={item}
          className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-violet-100 text-sm font-medium uppercase tracking-wide">This {dateRange}</p>
            <p className="text-4xl font-bold mt-2 mb-2">
              {isLoading ? (
                <span className="inline-block w-16 h-9 bg-white/20 animate-pulse rounded"></span>
              ) : (
                `+${totalNewItems}`
              )}
            </p>
            <div className="flex items-center text-violet-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">
                {itemsAddedInRange} products, {categoriesAddedInRange} categories
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Recent Products</h2>
                <Link href="/dashboard/products" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-6 flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 animate-pulse mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 w-1/3 bg-slate-200 animate-pulse mb-2 rounded"></div>
                      <div className="h-4 w-1/4 bg-slate-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                ))
              ) : products && products.length > 0 ? (
                products.slice(0, 5).map((product: any) => (
                  <div key={product._id || product.id} className="p-6 flex items-center hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center mr-4 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{product.name}</p>
                      <p className="text-sm text-slate-500">
                        {product.units !== undefined ? (
                          <span>{product.units} units available</span>
                        ) : (
                          <span>No units specified</span>
                        )}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Link href="/dashboard/products" className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors inline-flex" title="Edit in Products page">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span className="sr-only">Edit</span>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m8 4v10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-1">No products yet</h3>
                  <p className="text-slate-500 mb-4">Get started by adding your first product</p>
                  <Link href="/dashboard/products" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Product
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Inventory Status</h2>
                <span className="text-xs font-medium text-slate-500">Last updated today</span>
              </div>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-4 w-full bg-slate-200 animate-pulse rounded"></div>
                  <div className="h-24 w-full bg-slate-200 animate-pulse rounded"></div>
                  <div className="h-4 w-2/3 bg-slate-200 animate-pulse rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-200 animate-pulse rounded"></div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">Low stock items</span>
                      <span className="text-sm font-bold text-amber-600">
                        {products ? products.filter((p: any) => (p.units || 0) < 5).length : 0} items
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ 
                          width: products ? 
                            `${Math.min(100, Math.max(5, (products.filter((p: any) => (p.units || 0) < 5).length / Math.max(1, products.length)) * 100))}%` : 
                            '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">Out of stock</span>
                      <span className="text-sm font-bold text-red-600">
                        {products ? products.filter((p: any) => (p.units || 0) === 0).length : 0} items
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ 
                          width: products ? 
                            `${Math.min(100, Math.max(5, (products.filter((p: any) => (p.units || 0) === 0).length / Math.max(1, products.length)) * 100))}%` : 
                            '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">Well stocked</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {products ? products.filter((p: any) => (p.units || 0) >= 10).length : 0} items
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ 
                          width: products ? 
                            `${Math.min(100, Math.max(5, (products.filter((p: any) => (p.units || 0) >= 10).length / Math.max(1, products.length)) * 100))}%` : 
                            '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <Link href="/dashboard/products" className="flex items-center justify-center w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Generate Inventory Report
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
