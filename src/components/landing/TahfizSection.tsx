"use client";
import { motion } from 'framer-motion';
import { useI18n } from '@/components/i18n/I18nProvider';
import { 
  Star,
  TrendingUp,
  Mic,
  Award,
  BookOpen,
  CheckCircle,
  BarChart4
} from 'lucide-react';

const metrics = [
  { icon: Star, labelKey: 'landing.tahfiz_section.metric1', color: 'from-yellow-500 to-orange-500' },
  { icon: Mic, labelKey: 'landing.tahfiz_section.metric2', color: 'from-green-500 to-emerald-500' },
  { icon: Mic, labelKey: 'landing.tahfiz_section.metric3', color: 'from-blue-500 to-cyan-500' },
  { icon: Award, labelKey: 'landing.tahfiz_section.metric4', color: 'from-purple-500 to-pink-500' },
  { icon: BookOpen, labelKey: 'landing.tahfiz_section.metric5', color: 'from-indigo-500 to-purple-500' },
  { icon: CheckCircle, labelKey: 'landing.tahfiz_section.metric6', color: 'from-teal-500 to-green-500' },
  { icon: BarChart4, labelKey: 'landing.tahfiz_section.metric7', color: 'from-rose-500 to-red-500' },
];

export const TahfizSection = () => {
  const { t, dir } = useI18n();
  const isRTL = dir === 'rtl';

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 relative overflow-hidden">
      {/* Islamic Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tahfiz-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="60" cy="60" r="25" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M60 20 L60 100 M20 60 L100 60 M35 35 L85 85 M85 35 L35 85" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tahfiz-pattern)" className="text-emerald-600 dark:text-emerald-400"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 mb-6">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {t('landing.tahfiz_section.subtitle')}
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {t('landing.tahfiz_section.title')}
            </span>
          </h2>

          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('landing.tahfiz_section.description')}
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-6 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${metric.color} shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <metric.icon className="w-7 h-7 text-white" />
                </div>

                {/* Label */}
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {t(metric.labelKey)}
                </p>

                {/* Decorative Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.color} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          {[
            {
              title: 'Real-Time Tracking',
              desc: 'Monitor student progress with live updates and instant notifications',
              icon: TrendingUp
            },
            {
              title: 'Comprehensive Reports',
              desc: 'Generate detailed analytics on memorization and recitation quality',
              icon: BarChart4
            },
            {
              title: 'Parent Portal',
              desc: 'Keep parents informed with progress reports and achievement updates',
              icon: CheckCircle
            }
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 shadow-md hover:shadow-lg transition-shadow"
            >
              <item.icon className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
