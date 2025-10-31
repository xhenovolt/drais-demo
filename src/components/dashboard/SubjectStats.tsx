"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface SubjectStatsProps {
  data?: any[];
}

const SubjectStats: React.FC<SubjectStatsProps> = ({ data = [] }) => {
  // Mock subject data if none provided
  const subjects = data.length > 0 ? data : [
    { subjectId: 1, name: 'Mathematics', averageScore: 78, passRate: 85, trend: 'up' },
    { subjectId: 2, name: 'English', averageScore: 82, passRate: 90, trend: 'up' },
    { subjectId: 3, name: 'Science', averageScore: 65, passRate: 70, trend: 'down' },
    { subjectId: 4, name: 'History', averageScore: 75, passRate: 80, trend: 'stable' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Subject Performance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">School-wide overview</p>
        </div>
      </div>

      <div className="space-y-3">
        {subjects.slice(0, 5).map((subject, index) => (
          <motion.div
            key={subject.subjectId || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {subject.name || `Subject ${index + 1}`}
                </p>
                {getTrendIcon(subject.trend || 'stable')}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Pass Rate</span>
                    <span>{subject.passRate || subject._avg?.passRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.passRate || subject._avg?.passRate || 0}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                    />
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(subject.averageScore || subject._avg?.averageScore || 0)}`}>
                  {Math.round(subject.averageScore || subject._avg?.averageScore || 0)}%
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
          View Detailed Subject Analysis →
        </button>
      </div>
    </div>
  );
};

export default SubjectStats;
