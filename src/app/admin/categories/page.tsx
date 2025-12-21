"use client"
import { useEffect, useState } from 'react'

interface Category {
  _id: string
  name: string
  description?: string
  createdAt: string
  ownerId: string
  ownerEmail?: string
  ownerName?: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/admin/categories')
        if (!res.ok) throw new Error('Failed to fetch categories')
        const data = await res.json()
        setCategories(data.categories || [])
      } catch (err) {
        setError('Failed to load categories')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter(category => 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">All Categories</h1>
          <p className="text-slate-500 mt-1">View all categories from all users ({categories.length} total)</p>
        </div>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search categories or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Description</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Owner</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                      </div>
                      <span className="font-medium text-slate-800">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {category.description ? (
                      <span className="truncate max-w-xs block">{category.description}</span>
                    ) : (
                      <span className="text-slate-400">No description</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{category.ownerName || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{category.ownerEmail || '-'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            {searchTerm ? 'No categories match your search' : 'No categories found'}
          </div>
        )}
      </div>
    </div>
  )
}
