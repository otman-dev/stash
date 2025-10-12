import React from 'react';
import { motion } from 'framer-motion';
import { Product, Category } from '../lib/types';

interface CategoryStatsProps {
  categories: Category[];
  products: Product[];
}

const CategoryStats: React.FC<CategoryStatsProps> = ({ categories, products }) => {
  // Calculate stats
  const getCategoryProductCount = (categoryId: string) => {
    return products?.filter(p => p.categoryId === categoryId).length || 0;
  };

  const getCategoryStockCount = (categoryId: string) => {
    return products?.reduce((sum, p) => {
      if (p.categoryId === categoryId) {
        return sum + (p.units || 0);
      }
      return sum;
    }, 0) || 0;
  };

  // Calculate the maximum product count for scaling
  const maxProductCount = Math.max(...categories.map(c => getCategoryProductCount(c._id)), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">Category Overview</h2>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {categories.map((category) => {
            const productCount = getCategoryProductCount(category._id);
            const stockCount = getCategoryStockCount(category._id);
            const barWidth = (productCount / maxProductCount) * 100;
            
            return (
              <div key={category._id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    ></div>
                    <span className="font-medium text-slate-700">{category.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {productCount} {productCount === 1 ? 'product' : 'products'}
                  </span>
                </div>
                
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full" 
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  ></motion.div>
                </div>
                
                <div className="flex justify-between text-xs text-slate-500">
                  <span>
                    {stockCount} {stockCount === 1 ? 'unit' : 'units'} in stock
                  </span>
                  <span>
                    {productCount > 0 && (stockCount / productCount).toFixed(1)} units/product
                  </span>
                </div>
              </div>
            );
          })}
          
          {categories.length === 0 && (
            <div className="text-center py-6 text-slate-500">
              No categories available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryStats;