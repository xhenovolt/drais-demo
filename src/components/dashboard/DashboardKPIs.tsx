"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

interface KPIData {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendancePercentage: number;
  enrollmentGrowth: number;
  feesCollectedToday: number;
  defaultersCount: number;
}

interface DashboardKPIsProps {
  data?: KPIData;
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ data }) => {
  const kpis = [
    {
      title: 'Total Students',
      value: data?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      change: '+5% this month'
    },
    {
      title: 'Present Today',
      value: data?.presentToday || 0,
      percentage: data?.attendancePercentage || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      change: '+2% vs yesterday'
    },
    {
      title: 'Absent Today',
      value: data?.absentToday || 0,
      icon: UserX,
      color: 'bg-red-500',
      gradient: 'from-red-500 to-red-600',
      change: '-1% vs yesterday'
    },
    {
      title: 'Enrollment Growth',
      value: data?.enrollmentGrowth || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      change: 'Last 30 days'
    },
    {
      title: 'Fees Today',
      value: `UGX ${(data?.feesCollectedToday || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      gradient: 'from-yellow-500 to-yellow-600',
      change: '+15% vs avg'
    },
    {
      title: 'Fee Defaulters',
      value: data?.defaultersCount || 0,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600',
      change: '>30 days overdue',
      alert: (data?.defaultersCount || 0) > 10
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group ${
            kpi.alert ? 'ring-2 ring-orange-500' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full bg-gradient-to-br ${kpi.gradient} group-hover:scale-110 transition-transform duration-300`}>
              <kpi.icon className="w-6 h-6 text-white" />
            </div>
            {kpi.alert && (
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {kpi.title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpi.value}
              </p>
              {kpi.percentage !== undefined && (
                <span className="text-sm text-green-600 font-medium">
                  ({kpi.percentage}%)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {kpi.change}
            </p>
          </div>

          {/* Progress bar for attendance */}
          {kpi.percentage !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${kpi.percentage}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className={`h-2 rounded-full bg-gradient-to-r ${kpi.gradient}`}
                />
              </div>
            </div>
          )}

          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardKPIs;
