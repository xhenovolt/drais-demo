"use client";
import React, { useState } from 'react';
import { Bell, Search, Menu, User, Globe, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useThemeStore } from '@/hooks/useThemeStore';
import { useI18n } from '@/components/i18n/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import BellClient from '@/components/notifications/BellClient';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const theme = useTheme();
  const store = useThemeStore();
  const { t, lang, setLang, dir } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  // Hide navbar on the reports page
  if (pathname === '/academics/reports') {
    return null;
  }

  const navbarStyle = store.navbarStyle;
  const isRTL = dir === 'rtl';

  const navbarClasses = clsx(
    "fixed top-0 z-40 w-full transition-all duration-300",
    navbarStyle === 'glass' && "backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-white/10",
    navbarStyle === 'solid' && "bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shadow-sm",
    navbarStyle === 'transparent' && "bg-transparent"
  );

  // Enhanced hamburger toggle function
  const handleToggleSidebar = () => {
    // Dispatch custom event for mobile sidebar
    window.dispatchEvent(new CustomEvent('toggleSidebar'));
    // Also call the original onToggleSidebar for desktop if needed
    onToggleSidebar();
  };

  return (
    <nav className={navbarClasses} style={{ height: '4rem' }}>
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Enhanced Hamburger Menu - Now works for both mobile and desktop */}
            <button
              id="hamburger-button"
              onClick={handleToggleSidebar}
              className={clsx(
                "p-2 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                "group relative"
              )}
              aria-label="Toggle sidebar"
            >
              <div className="relative w-5 h-5">
                <motion.span
                  className="absolute top-0 left-0 w-5 h-0.5 bg-current transform transition-all duration-200 group-hover:bg-blue-500"
                  style={{ transformOrigin: "center" }}
                />
                <motion.span
                  className="absolute top-2 left-0 w-5 h-0.5 bg-current transform transition-all duration-200 group-hover:bg-blue-500"
                  style={{ transformOrigin: "center" }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 w-5 h-0.5 bg-current transform transition-all duration-200 group-hover:bg-blue-500"
                  style={{ transformOrigin: "center" }}
                />
              </div>
              
              {/* Subtle hover effect */}
              <div className="absolute inset-0 rounded-lg bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>

            {/* Logo/Brand */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <h1 className="hidden sm:block text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-purple-600 bg-clip-text text-transparent">
                DRAIS
              </h1>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white dark:focus:bg-slate-700 transition-all placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Mobile Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                aria-label="Switch language"
              >
                <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-[var(--color-primary)] transition-colors">
                  {lang.toUpperCase()}
                </span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => theme.setMode(theme.mode === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme.mode === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 hover:text-[var(--color-primary)] transition-colors" />
              ) : (
                <Sun className="w-5 h-5 text-gray-300 hover:text-yellow-400 transition-colors" />
              )}
            </button>

            {/* Notifications - Replace the old bell with BellClient */}
            <BellClient 
              userId={1} // TODO: Get from session
              schoolId={1} // TODO: Get from session
              className="relative"
            />

            {/* Theme Customizer Toggle */}
            <button
              onClick={() => store.toggleCustomizer?.()}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Theme settings"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Admin
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={clsx(
                      "absolute top-full mt-2 w-48 rounded-xl shadow-lg border",
                      "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700",
                      isRTL ? "left-0" : "right-0"
                    )}
                  >
                    <div className="p-2">
                      <a
                        href="#"
                        className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">{t('navigation.profile')}</span>
                      </a>
                      <a
                        href="#"
                        className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">{t('navigation.settings')}</span>
                      </a>
                      <hr className="my-2 border-gray-200 dark:border-gray-600" />
                      <a
                        href="#"
                        className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <span className="text-sm">{t('navigation.logout')}</span>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
            >
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
