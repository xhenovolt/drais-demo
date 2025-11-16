"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Clock, Calendar } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';

interface AttendanceTodayProps {
  schoolId: number;
}

const AttendanceToday: React.FC<AttendanceTodayProps> = ({ schoolId }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: attendanceData, isLoading } = useSWR(
    `/api/attendance/stats?school_id=${schoolId}&date=${today}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const stats = attendanceData?.data;

  // Mock class data for demonstration
  const classes = [
    { id: 1, name: 'P.1 Blue', present: 28, total: 32, percentage: 87.5 },
    { id: 2, name: 'P.2 Red', present: 30, total: 35, percentage: 85.7 },
    { id: 3, name: 'P.3 Green', present: 25, total: 30, percentage: 83.3 },
    { id: 4, name: 'P.4 Yellow', present: 22, total: 28, percentage: 78.6 },
  ];

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Today</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading attendance...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {stats.present}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Present</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-lg font-bold text-red-700 dark:text-red-300">
                  {stats.absent}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">Absent</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  {stats.late}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Late</p>
              </div>
            </div>
          )}

          {/* Class Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">By Class:</h4>
            {classes.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {cls.name}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceColor(cls.percentage)}`}>
                      {cls.percentage}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cls.percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                          className={`h-2 rounded-full ${
                            cls.percentage >= 90 ? 'bg-green-500' :
                            cls.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {cls.present}/{cls.total}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button className="w-full text-sm text-teal-600 hover:text-teal-700 transition-colors">
              View Full Attendance →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceToday;
