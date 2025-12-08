import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Product as ProductType } from '../lib/types'
import ConfirmModal from './ConfirmModal'

// Define a compatible product interface for the component
interface Product extends Omit<ProductType, '_id'> {
  _id: string;
  name: string;
  description?: string;
  media?: string[];
  units?: number;
  categoryId?: string | null;
  price?: number;
}

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (productId: string, selected: boolean) => void;
}

export default function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  selectable = false, 
  selected = false, 
  onSelect 
}: ProductCardProps) {
  const thumb = product.media && product.media.length ? product.media[0] : null
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isImageError, setIsImageError] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  const handleEdit = () => {
    if (onEdit) onEdit(product)
  }
  
  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(product._id)
    }
    setShowDeleteConfirm(false)
  }

  const handleViewDetails = () => {
    setActiveImageIndex(0)
    setShowDetails(true)
  }
  
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) onSelect(product._id, e.target.checked)
  }
  
  return (
    <>
      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
        role="article" 
        tabIndex={0} 
        className={`group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full ${
          selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
        }`}
      >
      {selectable && (
        <div className="absolute top-3 left-3 z-10">
          <label className="inline-flex">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              checked={selected}
              onChange={handleSelect}
            />
            <span className="sr-only">Select {product.name}</span>
          </label>
        </div>
      )}
      <div className="aspect-square w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden relative">
        {thumb && !isImageError ? (
          <img 
            src={thumb} 
            alt={product.name}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageError(true)} 
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`} 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Ribbon for no stock */}
        {(product.units === 0 || product.units === undefined) && (
          <div className="absolute top-0 left-0 w-full text-center py-1.5 bg-red-500 text-white text-xs font-medium tracking-wider shadow-sm transform rotate-0 origin-left">
            OUT OF STOCK
          </div>
        )}
        
        {/* Price tag */}
        {product.price !== undefined && product.price > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-blue-800 shadow-sm">
            ${product.price.toFixed(2)}
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 mb-2">
            {/* Units badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              {product.units !== undefined ? product.units : 0} in stock
            </span>
            
            {/* Category badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
              product.categoryId 
                ? 'bg-green-50 text-green-700' 
                : 'bg-amber-50 text-amber-700'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {product.categoryId ? 'Categorized' : 'Uncategorized'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-grow">
          {product.description || 'No description available for this product.'}
        </p>
        
        <div className="flex items-center justify-end gap-1 mt-auto pt-3 border-t border-slate-100">
          <button 
            onClick={handleEdit} 
            className="p-2 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Edit product"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            onClick={handleDelete} 
            className="p-2 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Delete product"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={handleViewDetails}
            className="p-2 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="View product details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      </motion.article>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Product Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60"
                onClick={() => setShowDetails(false)}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
              >
                {/* Close button */}
                <button
                  onClick={() => setShowDetails(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-700 transition-colors shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Image section */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200">
                  {product.media && product.media.length > 0 ? (
                    <>
                      <img
                        src={product.media[activeImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                      {/* Image navigation */}
                      {product.media.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImageIndex(prev => prev === 0 ? product.media!.length - 1 : prev - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setActiveImageIndex(prev => prev === product.media!.length - 1 ? 0 : prev + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {/* Image indicators */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {product.media.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  idx === activeImageIndex ? 'bg-blue-600' : 'bg-white/70 hover:bg-white'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Out of stock ribbon */}
                  {(product.units === 0 || product.units === undefined) && (
                    <div className="absolute top-4 left-0 bg-red-500 text-white px-4 py-1.5 text-sm font-medium shadow-md">
                      OUT OF STOCK
                    </div>
                  )}
                </div>

                {/* Content section */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
                    {product.price !== undefined && product.price > 0 && (
                      <div className="text-2xl font-bold text-blue-600 flex-shrink-0">
                        ${product.price.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-blue-800">
                        {product.units !== undefined ? product.units : 0} units in stock
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      product.categoryId ? 'bg-green-50' : 'bg-amber-50'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${product.categoryId ? 'text-green-600' : 'text-amber-600'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm font-medium ${product.categoryId ? 'text-green-800' : 'text-amber-800'}`}>
                        {product.categoryId ? 'Categorized' : 'Uncategorized'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {product.description || 'No description available for this product.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowDetails(false)
                        handleEdit()
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Product
                    </button>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
