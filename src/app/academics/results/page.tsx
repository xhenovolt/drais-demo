"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Star, Settings2, Sparkles } from 'lucide-react';
import ResultTypesManager from '@/components/academics/ResultTypesManager';
import ClassResultsManager from '@/components/academics/ClassResultsManager';
import TheologyResultsManager from '@/components/academics/TheologyResultsManager';

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 'result-types',
      label: 'Result Types',
      icon: Settings2,
      gradient: 'from-blue-500 to-cyan-400',
      description: 'Manage exam types and grading systems'
    },
    {
      id: 'secular-results',
      label: 'Academic Results',
      icon: GraduationCap,
      gradient: 'from-indigo-500 to-purple-500',
      description: 'Enter and manage secular academic results'
    },
    {
      id: 'theology-results',
      label: 'Theology Results',
      icon: BookOpen,
      gradient: 'from-emerald-500 to-teal-400',
      description: 'Manage Islamic studies and Quranic assessments'
    }
  ];

  const tabVariants = {
    inactive: {
      scale: 0.95,
      opacity: 0.7,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    active: {
      scale: 1,
      opacity: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/20">
      {/* Glass Morphism Container */}
      <div className="p-4 md:p-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Academic Results Center
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">
                Comprehensive assessment and evaluation management system
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="backdrop-blur-xl bg-white/20 dark:bg-slate-800/20 rounded-3xl p-2 shadow-2xl border border-white/30 dark:border-slate-700/30">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === index;
                
                return (
                  <motion.button
                    key={tab.id}
                    variants={tabVariants}
                    animate={isActive ? 'active' : 'inactive'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(index)}
                    className={`
                      relative px-6 py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300
                      flex items-center gap-3 min-w-0 flex-1 md:flex-initial
                      backdrop-blur-md border border-white/20 dark:border-slate-600/20
                      ${isActive 
                        ? 'text-white shadow-xl shadow-indigo-500/25' 
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                  >
                    {/* Active Tab Gradient Background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBg"
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tab.gradient} opacity-90`}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <div className="text-left min-w-0">
                        <div className="font-bold truncate">{tab.label}</div>
                        <div className={`text-xs opacity-75 truncate ${isActive ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
                          {tab.description}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="backdrop-blur-xl bg-white/30 dark:bg-slate-800/30 rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/40 overflow-hidden"
          >
            {/* Content Header */}
            <div className="p-6 border-b border-white/20 dark:border-slate-700/30 bg-gradient-to-r from-white/10 to-transparent dark:from-slate-800/20">
              <div className="flex items-center gap-3">
                {React.createElement(tabs[activeTab].icon, { 
                  className: `w-6 h-6 text-indigo-600 dark:text-indigo-400` 
                })}
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {tabs[activeTab].label}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {tabs[activeTab].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 0 && <ResultTypesManager />}
              {activeTab === 1 && <ClassResultsManager />}
              {activeTab === 2 && <TheologyResultsManager />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-gradient-to-r from-pink-400/10 to-rose-400/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
}