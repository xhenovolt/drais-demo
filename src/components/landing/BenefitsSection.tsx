"use client";
import { motion } from 'framer-motion';
import { useI18n } from '@/components/i18n/I18nProvider';
import { 
  FileX, 
  DollarSign, 
  Zap, 
  Users, 
  Building2, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const benefits = [
  {
    icon: FileX,
    titleKey: 'landing.benefits.benefit1_title',
    descKey: 'landing.benefits.benefit1_desc',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: DollarSign,
    titleKey: 'landing.benefits.benefit2_title',
    descKey: 'landing.benefits.benefit2_desc',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    titleKey: 'landing.benefits.benefit3_title',
    descKey: 'landing.benefits.benefit3_desc',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    icon: Users,
    titleKey: 'landing.benefits.benefit4_title',
    descKey: 'landing.benefits.benefit4_desc',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Building2,
    titleKey: 'landing.benefits.benefit5_title',
    descKey: 'landing.benefits.benefit5_desc',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    icon: Sparkles,
    titleKey: 'landing.benefits.benefit6_title',
    descKey: 'landing.benefits.benefit6_desc',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500'
  },
];

export const BenefitsSection = () => {
  const { t } = useI18n();

  return (
    <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent dark:from-blue-950/20"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 mb-6">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Outcome-Driven Results
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {t('landing.benefits.title')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('landing.benefits.subtitle')}
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 h-full overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                {/* Icon */}
                <div className={`relative mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br ${benefit.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 relative">
                  {t(benefit.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative">
                  {t(benefit.descKey)}
                </p>

                {/* Bottom Border Effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Below Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <a href="#contact">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              See DRAIS in Action →
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
