"use client";
import { motion } from 'framer-motion';
import { useI18n } from '@/components/i18n/I18nProvider';
import { Sparkles, Download, Calendar, ArrowRight, Zap, Globe2, BookCheck } from 'lucide-react';
import Link from 'next/link';

export const LandingHero = () => {
  const { t, dir } = useI18n();
  const isRTL = dir === 'rtl';

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-100">
                {t('landing.hero.badge')}
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-white">{t('landing.hero.title').split(' ').slice(0, 3).join(' ')}</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('landing.hero.title').split(' ').slice(3).join(' ')}
              </span>
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl sm:text-2xl text-blue-100 font-semibold mb-6">
              {t('landing.hero.subtitle')}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl">
              {t('landing.hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="#contact">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 min-w-[200px]">
                  <span className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {t('landing.hero.cta_primary')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>

              <Link href="/auth/login">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1 min-w-[200px]">
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    {t('landing.hero.cta_secondary')}
                  </span>
                </button>
              </Link>
            </div>

            {/* Soft CTA */}
            <button className="text-blue-200 hover:text-white font-medium flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              {t('landing.hero.cta_download')}
            </button>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Globe2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">Arabic • English • Multi-Language</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <BookCheck className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Islamic Modules Available</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Stats & Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Floating Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '28+', label: 'Schools', icon: '🏫', color: 'emerald' },
                { value: '100K+', label: 'Students', icon: '👨‍🎓', color: 'blue' },
                { value: '99.9%', label: 'Uptime', icon: '⚡', color: 'purple' },
                { value: '24/7', label: 'Support', icon: '💬', color: 'indigo' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  <div className={`
                    p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl 
                    border border-white/10 hover:border-${stat.color}-500/50
                    shadow-xl hover:shadow-2xl transition-all duration-300
                  `}>
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className={`text-3xl font-extrabold bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-300 bg-clip-text text-transparent mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                    
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-${stat.color}-500/0 to-${stat.color}-500/0 group-hover:from-${stat.color}-500/10 group-hover:to-${stat.color}-500/5 transition-all duration-300 pointer-events-none`}></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold">{t('landing.hero.trusted_by')}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <span>🇺🇬 Uganda</span>
                <span>•</span>
                <span>🇰🇪 Kenya</span>
                <span>•</span>
                <span>🇹🇿 Tanzania</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};
