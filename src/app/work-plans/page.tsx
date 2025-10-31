"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clipboard, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Target,
  Users,
  Building
} from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import NewBadge from '@/components/ui/NewBadge';

interface WorkPlan {
  id: number;
  title: string;
  description?: string;
  owner_type: string;
  owner_id?: number;
  start_datetime?: string;
  end_datetime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  assigned_to?: number;
  created_at: string;
  assignee_name?: string;
  department_name?: string;
}

const WorkPlansPage: React.FC = () => {
  const [schoolId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch work plans
  const { data: workPlansData, isLoading, mutate } = useSWR(
    `/api/work-plans?school_id=${schoolId}${statusFilter ? `&status=${statusFilter}` : ''}${priorityFilter ? `&priority=${priorityFilter}` : ''}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const workPlans: WorkPlan[] = workPlansData?.data || [];

  // Filter work plans based on search
  const filteredWorkPlans = workPlans.filter(plan =>
    !searchQuery || 
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <Pause className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'low':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📋 Work Plans
              </h1>
              <NewBadge size="sm" animated />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredWorkPlans.length} work plans
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Work Plan
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search work plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Work Plans List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading work plans...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredWorkPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1 space-y-3">
                      {/* Title and Status */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Clipboard className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {plan.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(plan.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                              {plan.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                              {plan.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {plan.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {plan.description}
                        </p>
                      )}

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {plan.assignee_name && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>Assigned to: {plan.assignee_name}</span>
                          </div>
                        )}
                        {plan.department_name && (
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            <span>{plan.department_name}</span>
                          </div>
                        )}
                        {plan.start_datetime && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {formatDistanceToNow(new Date(plan.start_datetime), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Progress */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {plan.progress}% Complete
                        </div>
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${plan.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                          <Target className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredWorkPlans.length === 0 && (
              <div className="text-center py-12">
                <Clipboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No work plans found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkPlansPage;
