"use client"
import { useState, FormEvent, useRef } from 'react'
import useSWR from '../../../lib/swrClient'
import ProductCard from '../../../components/ProductCard'
import Modal from '../../../components/Modal'
import ConfirmModal from '../../../components/ConfirmModal'
import { useToast } from '@/components/ToastContext'
import { Product, Category } from '../../../lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProductsPage() {
  const { data: products, mutate, isLoading } = useSWR<Product[]>('/api/products', fetcher)
  const { data: categories, isLoading: categoriesLoading } = useSWR<Category[]>('/api/categories', fetcher)
  const [form, setForm] = useState({ name: '', description: '', media: '', categoryId: '', units: 0, price: 0 })
  const [open, setOpen] = useState(false)
  const [noCategoryModalOpen, setNoCategoryModalOpen] = useState(false)
  const [filter, setFilter] = useState({ category: '', search: '' })
  const [editMode, setEditMode] = useState(false)
  const [currentProductId, setCurrentProductId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkActionOpen, setBulkActionOpen] = useState(false)
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const { showToast } = useToast()

  // Check if user has any categories
  const hasCategories = categories && categories.length > 0

  // Handle add product button click - check for categories first
  const handleAddProductClick = () => {
    if (!hasCategories) {
      setNoCategoryModalOpen(true)
    } else {
      setOpen(true)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      const body = { 
        ...form, 
        media: form.media ? [form.media] : [],
        price: form.price || undefined
      }
      
      if (editMode && currentProductId) {
        // Update existing product
        await fetch(`/api/products/${currentProductId}`, { 
          method: 'PUT', 
          body: JSON.stringify(body), 
          headers: { 'Content-Type': 'application/json' } 
        })
        showToast('Product updated successfully', 'success')
      } else {
        // Create new product
        await fetch('/api/products', { 
          method: 'POST', 
          body: JSON.stringify(body), 
          headers: { 'Content-Type': 'application/json' } 
        })
        showToast('Product added successfully', 'success')
      }
      
      resetForm()
      mutate()
      setOpen(false)
    } catch (error) {
      console.error('Error saving product:', error)
      showToast('An error occurred while saving the product', 'error')
    }
  }
  
  function resetForm() {
    setForm({ name: '', description: '', media: '', categoryId: '', units: 0, price: 0 })
    setPreview(null)
    setEditMode(false)
    setCurrentProductId(null)
  }

  // For demo purposes - in a real app, this would upload to a storage service
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Simulate upload
      setUploadingImage(true)
      
      // Create a preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
        // In a real app, you'd upload to storage and get a URL
        setForm({ ...form, media: reader.result as string })
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Bulk actions
  const handleSelectProduct = (productId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }
  
  const handleSelectAllProducts = (isSelected: boolean) => {
    if (isSelected && filteredProducts) {
      setSelectedProducts(filteredProducts.map(p => p._id))
    } else {
      setSelectedProducts([])
    }
  }
  
  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return
    setBulkDeleteModalOpen(true)
  }

  const confirmBulkDelete = async () => {
    setIsBulkDeleting(true)
    try {
      // In a real app, you might want to implement a bulk delete API
      // For now, we'll delete them one by one
      await Promise.all(
        selectedProducts.map(id => 
          fetch(`/api/products/${id}`, { method: 'DELETE' })
        )
      )
      
      showToast(`${selectedProducts.length} products deleted successfully`, 'success')
      setSelectedProducts([])
      mutate()
      setBulkDeleteModalOpen(false)
    } catch (error) {
      console.error('Error deleting products:', error)
      showToast('Error deleting products', 'error')
    } finally {
      setIsBulkDeleting(false)
    }
  }
  
  // Filter products based on category and search term
  const filteredProducts = products?.filter(product => {
    const matchesCategory = !filter.category || product.categoryId === filter.category
    const matchesSearch = !filter.search || 
      product.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      (product.description?.toLowerCase().includes(filter.search.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  // Get category name by id
  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return 'Uncategorized'
    const category = categories?.find(c => c._id === categoryId)
    return category?.name || 'Unknown Category'
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Products</h2>
          <p className="text-slate-500 mt-1">
            Manage your inventory and product catalog
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {selectedProducts.length > 0 ? (
            <>
              <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                {selectedProducts.length} selected
              </span>
              <button 
                onClick={handleBulkDelete} 
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={handleAddProductClick} 
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Product
            </button>
          )}
        </div>
      </header>

      {/* No Categories Warning Banner */}
      {!categoriesLoading && !hasCategories && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">Create a category first</h3>
            <p className="text-sm text-amber-700 mt-1">
              You need to create at least one category before adding products. Categories help you organize your inventory.
            </p>
            <Link 
              href="/dashboard/categories" 
              className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-800 hover:text-amber-900"
            >
              Go to Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Search products..." 
            />
          </div>
          <div className="w-full sm:w-64">
            <select 
              value={filter.category} 
              onChange={(e) => setFilter({...filter, category: e.target.value})} 
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="">All Categories</option>
              {categories && categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredProducts && filteredProducts.length > 0 && (
          <div className="mb-4 flex items-center">
            <label className="inline-flex items-center cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                  onChange={(e) => handleSelectAllProducts(e.target.checked)}
                />
                <div className="w-5 h-5 border-2 border-slate-300 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:ring-offset-1 transition-all duration-200 group-hover:border-blue-400">
                  <svg 
                    className="w-full h-full text-white opacity-0 peer-checked:opacity-100 p-0.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <svg 
                  className={`absolute top-0 left-0 w-5 h-5 text-white p-0.5 pointer-events-none transition-opacity duration-200 ${
                    filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length ? 'opacity-100' : 'opacity-0'
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ml-2 text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Select all</span>
            </label>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProducts.map((p) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard 
                    product={p}
                    selectable={true}
                    selected={selectedProducts.includes(p._id)}
                    onSelect={handleSelectProduct}
                    onEdit={(product) => {
                      setForm({
                        name: product.name,
                        description: product.description || '',
                        media: product.media && product.media.length ? product.media[0] : '',
                        categoryId: product.categoryId || '',
                        units: product.units || 0,
                        price: product.price || 0
                      })
                      if (product.media && product.media.length) {
                        setPreview(product.media[0])
                      }
                      setCurrentProductId(product._id)
                      setEditMode(true)
                      setOpen(true)
                    }}
                    onDelete={async (productId) => {
                      try {
                        await fetch(`/api/products/${productId}`, { 
                          method: 'DELETE'
                        })
                        showToast('Product deleted successfully', 'success')
                        mutate()
                      } catch (error) {
                        console.error('Error deleting product:', error)
                        showToast('Error deleting product', 'error')
                      }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700">No products found</h3>
            <p className="text-slate-500 mt-2 mb-4">
              {filter.search || filter.category 
                ? "Try adjusting your search or filter to find what you're looking for."
                : hasCategories 
                  ? "Get started by adding your first product."
                  : "Create a category first, then add your products."}
            </p>
            {!filter.search && !filter.category && (
              hasCategories ? (
                <button 
                  onClick={handleAddProductClick}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Your First Product
                </button>
              ) : (
                <Link 
                  href="/dashboard/categories"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Your First Category
                </Link>
              )
            )}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); resetForm(); }} title={editMode ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
              <input 
                required
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                placeholder="Enter product name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={form.categoryId} 
                onChange={e => setForm({ ...form, categoryId: e.target.value })} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Uncategorized</option>
                {categories && categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units in Stock</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="number" 
                  min="0"
                  value={String(form.units)} 
                  onChange={e => setForm({ ...form, units: Number(e.target.value) || 0 })} 
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price || ''} 
                  onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} 
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              placeholder="Describe your product..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Upload Image
                        </>
                      )}
                    </button>
                    {preview && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, media: '' })
                          setPreview(null)
                        }}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload a product image. Recommended size: 600x600px.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => { setOpen(false); resetForm(); }} 
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editMode ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* No Category Modal */}
      <Modal 
        open={noCategoryModalOpen} 
        onClose={() => setNoCategoryModalOpen(false)} 
        title="Category Required"
      >
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Create a Category First</h3>
          <p className="text-slate-600 mb-6">
            Before adding products, you need to create at least one category to organize your inventory. 
            Categories help you group similar products together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setNoCategoryModalOpen(false)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <Link
              href="/dashboard/categories"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Category
            </Link>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Products"
        message={`Are you sure you want to delete ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
        isLoading={isBulkDeleting}
      />
    </div>
  )
}
