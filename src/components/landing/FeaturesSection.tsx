"use client";
import { motion } from 'framer-motion';
import { useI18n } from '@/components/i18n/I18nProvider';
import { 
  BookOpen, 
  DollarSign, 
  Users, 
  BarChart3, 
  MessageSquare, 
  CheckCircle,
  BookMarked
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    titleKey: 'landing.features.academic_title',
    descKey: 'landing.features.academic_desc',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BookMarked,
    titleKey: 'landing.features.tahfiz_title',
    descKey: 'landing.features.tahfiz_desc',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: DollarSign,
    titleKey: 'landing.features.finance_title',
    descKey: 'landing.features.finance_desc',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: CheckCircle,
    titleKey: 'landing.features.attendance_title',
    descKey: 'landing.features.attendance_desc',
    color: 'orange',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: MessageSquare,
    titleKey: 'landing.features.communication_title',
    descKey: 'landing.features.communication_desc',
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    icon: BarChart3,
    titleKey: 'landing.features.analytics_title',
    descKey: 'landing.features.analytics_desc',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500'
  },
];

export const FeaturesSection = () => {
  const { t } = useI18n();

  return (
    <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5 dark:opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
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
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                {/* Icon Container */}
                <div className={`mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t(feature.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t(feature.descKey)}
                </p>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
