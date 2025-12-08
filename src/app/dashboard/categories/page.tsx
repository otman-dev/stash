"use client"
import { useState, FormEvent } from 'react'
import useSWR from '../../../lib/swrClient'
import Modal from '../../../components/Modal'
import CategoryStats from '@/components/CategoryStats'
import { useToast } from '@/components/ToastContext'
import { Category, Product } from '../../../lib/types'
import { motion, AnimatePresence } from 'framer-motion'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CategoriesPage() {
  const { data: categories, mutate, isLoading } = useSWR<Category[]>('/api/categories', fetcher)
  const { data: products } = useSWR<Product[]>('/api/products', fetcher)
  const [form, setForm] = useState({ name: '', description: '', color: '#3B82F6' })
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToast()

  // Predefined category colors
  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Teal', value: '#14B8A6' }
  ]

  const filteredCategories = categories?.filter(category =>
    !searchTerm || category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (editMode && currentCategoryId) {
        await fetch(`/api/categories/${currentCategoryId}`, { 
          method: 'PUT', 
          body: JSON.stringify(form), 
          headers: { 'Content-Type': 'application/json' } 
        })
        showToast('Category updated successfully', 'success')
      } else {
        await fetch('/api/categories', { 
          method: 'POST', 
          body: JSON.stringify(form), 
          headers: { 'Content-Type': 'application/json' } 
        })
        showToast('Category created successfully', 'success')
      }
      resetForm()
      mutate()
      setOpen(false)
    } catch (error) {
      console.error('Error saving category:', error)
      showToast('An error occurred while saving the category', 'error')
    }
  }

  function editCategory(category: Category) {
    setForm({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    })
    setCurrentCategoryId(category._id)
    setEditMode(true)
    setOpen(true)
  }

  async function deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' })
        showToast('Category deleted successfully', 'success')
        mutate()
      } catch (error) {
        console.error('Error deleting category:', error)
        showToast('Error deleting category', 'error')
      }
    }
  }

  function resetForm() {
    setForm({ name: '', description: '', color: '#3B82F6' })
    setCurrentCategoryId(null)
    setEditMode(false)
  }

  function openAddModal() {
    resetForm()
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
          <p className="text-slate-500 mt-1">
            Organize your products by creating and managing categories
          </p>
        </div>
        
        <button 
          onClick={openAddModal} 
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Category
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {categories && products && (
            <CategoryStats categories={categories} products={products} />
          )}
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Quick Stats</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-blue-800 font-semibold text-lg">
                    {categories?.length || 0}
                  </div>
                  <div className="text-sm text-blue-600">
                    Total Categories
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-green-800 font-semibold text-lg">
                    {products?.filter(p => p.categoryId).length || 0}
                  </div>
                  <div className="text-sm text-green-600">
                    Categorized Products
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="text-amber-800 font-semibold text-lg">
                    {products?.filter(p => !p.categoryId).length || 0}
                  </div>
                  <div className="text-sm text-amber-600">
                    Uncategorized Products
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-purple-800 font-semibold text-lg">
                    {products?.length ? 
                      Math.round((products.filter(p => p.categoryId).length / products.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-purple-600">
                    Coverage Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center mb-6">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Search categories..." 
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCategories && filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredCategories.map((category) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative group bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div 
                    className="absolute top-0 left-0 w-full h-1.5" 
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  ></div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 text-lg truncate">
                        {category.name}
                      </h3>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => editCategory(category)}
                            className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            <span className="sr-only">Edit</span>
                          </button>
                          <button 
                            onClick={() => deleteCategory(category._id)}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    {category.createdAt && (
                      <div className="mt-4 flex items-center text-xs text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Created {new Date(category.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700">No categories found</h3>
            <p className="text-slate-500 mt-2 mb-4">
              {searchTerm 
                ? "No categories match your search. Try different keywords."
                : "Get started by adding your first category."}
            </p>
            {!searchTerm && (
              <button 
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Your First Category
              </button>
            )}
          </div>
        )}
      </div>

      <Modal 
        open={open} 
        onClose={() => {
          setOpen(false)
          resetForm()
        }} 
        title={editMode ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name*</label>
            <input 
              required
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              placeholder="Enter category name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              placeholder="Add a short description for this category"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Color</label>
            <div className="grid grid-cols-7 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: color.value })}
                  className={`h-8 w-full rounded-md border-2 ${
                    form.color === color.value ? 'border-black' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editMode ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
