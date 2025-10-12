"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const { t, dir } = useLanguage();

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12" />
            <div>
              <div className="text-xl font-bold text-blue-600">{t('common.stash')}</div>
              <div className="text-xs text-slate-500">{t('common.tagline')}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t('common.signIn')}
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6"
              >
                {t('home.hero.title')} <span className="text-blue-600">{t('home.hero.titleHighlight')}</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg sm:text-xl text-slate-600 mb-8 max-w-xl"
              >
                {t('home.hero.description')}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link 
                  href="/login" 
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium text-lg shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-1"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {t('common.getStarted')}
                  {isHovered && (
                    <motion.span 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                      className="block h-0.5 bg-white mt-0.5"
                    />
                  )}
                </Link>
                
                <button className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium text-lg hover:bg-slate-50 transition-all">
                  {t('common.learnMore')}
                </button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 text-sm text-slate-500 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>{t('common.privateUseNotice')}</span>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-10"></div>
              <div className="absolute inset-0 bg-amber-500 rounded-3xl -rotate-3 opacity-10"></div>
              
              <div className="relative bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{t('dashboard.inventoryStatus')}</div>
                      <div className="text-xs text-slate-500">{t('common.updatedToday')}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-emerald-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    +12.5%
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-600">Electronics</span>
                      <span className="text-sm font-bold text-blue-600">85%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-600">Furniture</span>
                      <span className="text-sm font-bold text-emerald-600">62%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full">
                      <div className="h-2 bg-emerald-500 rounded-full" style={{ width: "62%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-600">Office Supplies</span>
                      <span className="text-sm font-bold text-amber-600">47%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full">
                      <div className="h-2 bg-amber-500 rounded-full" style={{ width: "47%" }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">{t('common.totalProducts')}</div>
                    <div className="text-2xl font-bold text-slate-900">473</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Features */}
        <section className="py-12 lg:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('home.features.title')}</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">{t('home.features.subtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('home.features.productManagement.title')}</h3>
              <p className="text-slate-600">{t('home.features.productManagement.description')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('home.features.categoryOrganization.title')}</h3>
              <p className="text-slate-600">{t('home.features.categoryOrganization.description')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('home.features.analyticsReports.title')}</h3>
              <p className="text-slate-600">{t('home.features.analyticsReports.description')}</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Logo className="h-8 w-8" />
              <div className="text-sm text-slate-500">
                © 2025 {t('common.stash')}. {t('home.footer.allRightsReserved')}
              </div>
            </div>
            
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-blue-600 transition-colors">{t('home.footer.terms')}</a>
              <a href="#" className="hover:text-blue-600 transition-colors">{t('home.footer.privacy')}</a>
              <a href="#" className="hover:text-blue-600 transition-colors">{t('home.footer.contact')}</a>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>{t('home.footer.privateUse')}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
