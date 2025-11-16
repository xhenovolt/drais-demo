"use client";
import { motion } from 'framer-motion';
import { useI18n } from '@/components/i18n/I18nProvider';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const CTASection = () => {
  const { t } = useI18n();

  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full filter blur-3xl animate-pulse animation-delay-1000"></div>
        </div>
      </div>

      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 0 L60 20 L40 40 L20 20 Z M40 40 L60 60 L40 80 L20 60 Z M0 40 L20 60 L0 80 M80 40 L60 60 L80 80" stroke="white" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              Limited Time Offer
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            {t('landing.cta_section.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            {t('landing.cta_section.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/login">
              <button className="group relative px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 min-w-[240px]">
                <span className="flex items-center justify-center gap-2">
                  {t('landing.cta_section.cta_primary')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>

            <button className="px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 min-w-[240px]">
              {t('landing.cta_section.cta_secondary')}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>30-Day Money Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};
