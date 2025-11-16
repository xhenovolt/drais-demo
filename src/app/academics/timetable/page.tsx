'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Edit,
  Trash2,
  RotateCcw,
  Bell,
  Eye,
  Printer,
  X,
  Grid,
  List,
  Table,
  CalendarDays
} from 'lucide-react';
import useSWR from 'swr';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

import TimetableModal from '@/components/timetable/TimetableModal';
import ShareModal from '@/components/timetable/ShareModal';
import RecurringIndicator from '@/components/timetable/RecurringIndicator';
import ConflictIndicator from '@/components/timetable/ConflictIndicator';
import { generateTimetablePDF } from '@/lib/pdfGenerator';

interface Lesson {
  id: number;
  school_id: number;
  teacher_id: number;
  class_id: number;
  subject_id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  room?: string;
  venue?: string;
  lesson_title?: string;
  lesson_description?: string;
  lesson_type: string;
  status: string;
  attendance_taken: boolean;
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
  parent_timetable_id?: number;
  notes?: string;
  class_name: string;
  subject_name: string;
  teacher_name: string;
  teacher_photo?: string;
  created_at: string;
  updated_at: string;
}

interface Metadata {
  classes: Array<{ id: number; name: string }>;
  subjects: Array<{ id: number; name: string; subject_type: string }>;
  teachers: Array<{ id: number; name: string; photo_url?: string; position: string }>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TimetablePage = () => {
  const [filters, setFilters] = useState({
    school_id: '1',
    teacher_id: '',
    class_id: '',
    subject_id: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [conflictChecks, setConflictChecks] = useState<Map<number, any[]>>(new Map());
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table' | 'calendar'>('list');

  // Fetch timetable data
  const { data: timetableData, error: timetableError, mutate: mutateTimetable } = useSWR(
    `/api/timetable?${new URLSearchParams({...filters, expand_recurring: 'true'}).toString()}`,
    fetcher
  );

  // Fetch metadata
  const { data: metadataData } = useSWR<{ success: boolean; data: Metadata }>(
    `/api/timetable/metadata?school_id=${filters.school_id}`,
    fetcher
  );

  const lessons: Lesson[] = timetableData?.data || [];
  const metadata = metadataData?.data;

  // Set default date range (current week)
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    
    setFilters(prev => ({
      ...prev,
      date_from: startOfWeek.toISOString().split('T')[0],
      date_to: endOfWeek.toISOString().split('T')[0]
    }));
  }, []);

  // Theme detection and real-time switching
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial theme setup
    const updateTheme = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Set initial theme
    updateTheme();

    // Listen for real-time changes
    mediaQuery.addEventListener('change', updateTheme);

    // Cleanup listener
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  const handleCreateLesson = () => {
    setEditingLesson(null);
    setIsModalOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    const result = await Swal.fire({
      title: 'Delete Lesson?',
      text: `Are you sure you want to delete "${lesson.lesson_title || lesson.subject_name}" lesson?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: 'var(--swal-bg)',
      color: 'var(--swal-text)',
      backdrop: 'rgba(0, 0, 0, 0.8)',
      customClass: {
        popup: 'backdrop-blur-md border border-gray-200 dark:border-gray-700',
      },
      didOpen: () => {
        // Apply theme-aware colors to SweetAlert2
        const isDark = document.documentElement.classList.contains('dark');
        const popup = document.querySelector('.swal2-popup') as HTMLElement;
        if (popup) {
          popup.style.setProperty('--swal-bg', isDark ? '#1e293b' : '#ffffff');
          popup.style.setProperty('--swal-text', isDark ? '#f1f5f9' : '#1f2937');
          popup.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
          popup.style.color = isDark ? '#f1f5f9' : '#1f2937';
        }
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/timetable?id=${lesson.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          toast.success('Lesson deleted successfully');
          mutateTimetable();
        } else {
          toast.error('Failed to delete lesson');
        }
      } catch (error) {
        toast.error('Error deleting lesson');
      }
    }
  };

  const handlePrintTimetable = async () => {
    try {
      await generateTimetablePDF(lessons, filters);
      toast.success('PDF generated successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const checkLessonConflicts = async (lesson: Lesson) => {
    try {
      const response = await fetch('/api/timetable/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: lesson.teacher_id,
          class_id: lesson.class_id,
          lesson_date: lesson.lesson_date,
          start_time: lesson.start_time,
          end_time: lesson.end_time,
          school_id: lesson.school_id,
          exclude_lesson_id: lesson.id,
          recurrence: lesson.recurrence || 'none',
          start_date: lesson.start_date,
          end_date: lesson.end_date
        })
      });

      const result = await response.json();
      if (result.success && result.has_conflicts) {
        setConflictChecks(prev => new Map(prev.set(lesson.id, result.conflicts)));
      } else {
        setConflictChecks(prev => {
          const newMap = new Map(prev);
          newMap.delete(lesson.id);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error checking lesson conflicts:', error);
    }
  };

  // Check conflicts for visible lessons
  useEffect(() => {
    if (lessons.length > 0) {
      // Check conflicts for first 10 lessons to avoid overwhelming the API
      lessons.slice(0, 10).forEach(lesson => {
        checkLessonConflicts(lesson);
      });
    }
  }, [lessons]);

  const handleCreateException = (lesson: Lesson) => {
    // TODO: Implement exception creation modal
    // This would open a modal to create exceptions for recurring lessons
    toast.info('Exception management feature coming soon!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30';
      case 'ongoing': return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30';
      case 'completed': return 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500/30';
      case 'cancelled': return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30';
      case 'rescheduled': return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/30';
      default: return 'bg-gray-100 dark:bg-slate-500/20 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-500/30';
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'revision': return 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'exam': return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400';
      case 'practical': return 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400';
      case 'field_trip': return 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'makeup': return 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'extra': return 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
      default: return 'bg-gray-50 dark:bg-slate-500/10 text-gray-600 dark:text-slate-400';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const ViewModeSelector = () => (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg p-1">
      {
        [
        {
          mode: 'list',
          icon: List,
          label: 'List'
        },
        {
          mode: 'grid',
          icon: Grid,
          label: 'Grid'
        },
        {
          mode: 'table',
          icon: Table,
          label: 'Table'
        },
        {
          mode: 'calendar',
          icon: CalendarDays,
          label: 'Calendar'
        }
        ].map(({ mode, icon: Icon, label }) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(mode as any)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                viewMode === mode
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`
            }
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </motion.button>
      ))
      }
    </div>
  );

  const ListView = () => (
    <div className="grid gap-4">
      {lessons.map((lesson, index) => {
        const lessonConflicts = conflictChecks.get(lesson.id) || [];
        
        return (
          <motion.div
            key={`${lesson.id}-${lesson.lesson_date}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`backdrop-blur-sm border rounded-xl p-6 transition-all duration-200 ${
              lessonConflicts.length > 0
                ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/30'
                : 'bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600/50'
            } shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Main Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-3">
                  {lesson.teacher_photo && (
                    <img
                      src={lesson.teacher_photo}
                      alt={lesson.teacher_name}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-slate-600"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {lesson.lesson_title || `${lesson.subject_name} - ${lesson.class_name}`}
                      </h3>
                      
                      {/* Conflict Indicator */}
                      {lessonConflicts.length > 0 && (
                        <ConflictIndicator 
                          conflicts={lessonConflicts}
                          isCompact={true}
                        />
                      )}
                      
                      {/* Recurring Indicator */}
                      <RecurringIndicator 
                        recurrence={lesson.recurrence || 'none'}
                        startDate={lesson.start_date}
                        endDate={lesson.end_date}
                        occurrenceDate={lesson.lesson_date}
                      />
                      
                      {/* Exception Status */}
                      {lesson.exception_type && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border transition-colors duration-300 ${
                          lesson.exception_type === 'skip' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30' :
                          lesson.exception_type === 'reschedule' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/30' :
                          'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30'
                        }`}>
                          {lesson.exception_type === 'skip' ? 'Cancelled' : 
                           lesson.exception_type === 'reschedule' ? 'Rescheduled' : 'Modified'}
                        </span>
                      )}
                      
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border transition-colors duration-300 ${getStatusColor(lesson.status)}`}>
                        {lesson.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs transition-colors duration-300 ${getLessonTypeColor(lesson.lesson_type)}`}>
                        {lesson.lesson_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {lesson.teacher_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {lesson.subject_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(lesson.lesson_date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}
                      </div>
                      {lesson.room && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {lesson.room}
                        </div>
                      )}
                    </div>

                    {/* Detailed Conflicts */}
                    {lessonConflicts.length > 0 && (
                      <div className="mt-3">
                        <ConflictIndicator 
                          conflicts={lessonConflicts}
                          isCompact={false}
                        />
                      </div>
                    )}

                    {/* Exception Details */}
                    {lesson.exception_reason && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-400 dark:border-yellow-500/50 rounded">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Note:</strong> {lesson.exception_reason}
                        </p>
                        {lesson.new_date && (
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Rescheduled to: {formatDate(lesson.new_date)} at {formatTime(lesson.new_start_time)} - {formatTime(lesson.new_end_time)}
                          </p>
                        )}
                      </div>
                    )}

                    {lesson.lesson_description && (
                      <p className="text-gray-700 dark:text-slate-300 text-sm mt-2">{lesson.lesson_description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Add exception button for recurring classes */}
                {lesson.recurrence !== 'none' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCreateException(lesson)}
                    className="p-2 bg-orange-100 dark:bg-orange-600/20 hover:bg-orange-200 dark:hover:bg-orange-600/30 text-orange-600 dark:text-orange-400 rounded-lg transition-all duration-200"
                    title="Manage Exception"
                  >
                    <Calendar className="w-4 h-4" />
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditLesson(lesson)}
                  className="p-2 bg-blue-100 dark:bg-blue-600/20 hover:bg-blue-200 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200"
                  title="Edit Lesson"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteLesson(lesson)}
                  className="p-2 bg-red-100 dark:bg-red-600/20 hover:bg-red-200 dark:hover:bg-red-600/30 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200"
                  title="Delete Lesson"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {lessons.map((lesson, index) => {
        const lessonConflicts = conflictChecks.get(lesson.id) || [];
        
        return (
          <motion.div
            key={`${lesson.id}-${lesson.lesson_date}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`backdrop-blur-sm border rounded-xl p-4 transition-all duration-200 ${
              lessonConflicts.length > 0
                ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
                : 'bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700/50'
            } shadow-sm hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {lesson.teacher_photo && (
                  <img
                    src={lesson.teacher_photo}
                    alt={lesson.teacher_name}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-slate-600"
                  />
                )}
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {formatDate(lesson.lesson_date)}
                </div>
              </div>
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {formatTime(lesson.start_time)}
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 text-sm leading-tight">
              {lesson.lesson_title || `${lesson.subject_name}`}
            </h3>

            <div className="space-y-1 text-xs text-gray-600 dark:text-slate-400 mb-3">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{lesson.class_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">{lesson.teacher_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}</span>
              </div>
              {lesson.room && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{lesson.room}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {lessonConflicts.length > 0 && (
                  <ConflictIndicator conflicts={lessonConflicts} isCompact={true} />
                )}
                <RecurringIndicator 
                  recurrence={lesson.recurrence || 'none'}
                  startDate={lesson.start_date}
                  endDate={lesson.end_date}
                  occurrenceDate={lesson.lesson_date}
                />
              </div>
              
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEditLesson(lesson)}
                  className="p-1 bg-blue-100 dark:bg-blue-600/20 hover:bg-blue-200 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 rounded"
                >
                  <Edit className="w-3 h-3" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteLesson(lesson)}
                  className="p-1 bg-red-100 dark:bg-red-600/20 hover:bg-red-200 dark:hover:bg-red-600/30 text-red-600 dark:text-red-400 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const TableView = () => (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Teacher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {lessons.map((lesson, index) => {
              const lessonConflicts = conflictChecks.get(lesson.id) || [];
              
              return (
                <motion.tr
                  key={`${lesson.id}-${lesson.lesson_date}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${
                    lessonConflicts.length > 0 ? 'bg-red-50 dark:bg-red-500/5' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-slate-100">
                      {formatDate(lesson.lesson_date)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {lesson.subject_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {lesson.lesson_title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                    {lesson.class_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {lesson.teacher_photo && (
                        <img
                          className="h-8 w-8 rounded-full mr-3"
                          src={lesson.teacher_photo}
                          alt={lesson.teacher_name}
                        />
                      )}
                      <div className="text-sm text-gray-900 dark:text-slate-100">
                        {lesson.teacher_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                    {lesson.room || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(lesson.status)}`}>
                        {lesson.status}
                      </span>
                      {lessonConflicts.length > 0 && (
                        <ConflictIndicator conflicts={lessonConflicts} isCompact={true} />
                      )}
                      <RecurringIndicator 
                        recurrence={lesson.recurrence || 'none'}
                        startDate={lesson.start_date}
                        endDate={lesson.end_date}
                        occurrenceDate={lesson.lesson_date}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditLesson(lesson)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteLesson(lesson)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
              
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CalendarView = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    
    const getWeekDays = (date: Date) => {
      const week = [];
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        week.push(day);
      }
      return week;
    };

    const weekDays = getWeekDays(currentWeek);
    const timeSlots = Array.from({ length: 12 }, (_, i) => {
      const hour = 7 + i; // 7 AM to 6 PM
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    const getLessonsForDay = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return lessons.filter(lesson => lesson.lesson_date === dateStr);
    };

    return (
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Week of {weekDays[0].toLocaleDateString()}
          </h3>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}
              className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-md text-sm"
            >
              Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentWeek(new Date())}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-md text-sm"
            >
              Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}
              className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-md text-sm"
            >
              Next
            </motion.button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-slate-700">
              <div className="p-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Time
              </div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-3 text-center border-l border-gray-200 dark:border-slate-700">
                  <div className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {timeSlots.map((time, timeIndex) => (
              <div key={timeIndex} className="grid grid-cols-8 border-b border-gray-100 dark:border-slate-800">
                <div className="p-3 text-xs text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-700">
                  {time}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dayLessons = getLessonsForDay(day);
                  const slotLessons = dayLessons.filter(lesson => {
                    const lessonHour = parseInt(lesson.start_time.split(':')[0]);
                    const slotHour = parseInt(time.split(':')[0]);
                    return lessonHour === slotHour;
                  });

                  return (
                    <div key={dayIndex} className="p-1 min-h-[60px] border-l border-gray-100 dark:border-slate-800 relative">
                      {slotLessons.map((lesson, lessonIndex) => (
                        <motion.div
                          key={`${lesson.id}-${lessonIndex}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-1 bg-blue-100 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-500/30 rounded p-1 text-xs cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-600/30 transition-colors"
                          onClick={() => handleEditLesson(lesson)}
                          style={{
                            top: `${lessonIndex * 2}px`,
                            zIndex: lessonIndex + 1
                          }}
                        >
                          <div className="font-medium text-blue-800 dark:text-blue-200 truncate">
                            {lesson.subject_name}
                          </div>
                          <div className="text-blue-600 dark:text-blue-300 truncate">
                            {lesson.class_name}
                          </div>
                          <div className="text-blue-500 dark:text-blue-400 truncate">
                            {lesson.room}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (lessons.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Calendar className="w-16 h-16 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-slate-400 mb-2">No Lessons Found</h3>
          <p className="text-gray-500 dark:text-slate-500 mb-6">Create your first lesson to get started</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateLesson}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add First Lesson
          </motion.button>
        </motion.div>
      );
    }

    switch (viewMode) {
      case 'grid':
        return <GridView />;
      case 'table':
        return <TableView />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <ListView />;
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      {/* Header - Now properly positioned within content area */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700/50">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Timetable Management
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">Manage lessons, schedules, and notifications</p>
            </div>

            <div className="flex items-center gap-3">
              <ViewModeSelector />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrintTimetable}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print PDF</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateLesson}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Lesson
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Now with proper z-index below header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/30 bg-white dark:bg-slate-900/50 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            />
          </div>

          <select
            value={filters.class_id}
            onChange={(e) => setFilters(prev => ({ ...prev, class_id: e.target.value }))}
            className="px-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
          >
            <option value="">All Classes</option>
            {metadata?.classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>

          <select
            value={filters.subject_id}
            onChange={(e) => setFilters(prev => ({ ...prev, subject_id: e.target.value }))}
            className="px-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
          >
            <option value="">All Subjects</option>
            {metadata?.subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>

          <select
            value={filters.teacher_id}
            onChange={(e) => setFilters(prev => ({ ...prev, teacher_id: e.target.value }))}
            className="px-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
          >
            <option value="">All Teachers</option>
            {metadata?.teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
            className="px-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
          />

          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
            className="px-4 py-2 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
          />
        </div>
      </div>

      {/* Content - Properly positioned below all fixed elements */}
      <div className="px-6 py-6 relative z-0">
        {renderContent()}
      </div>

      {/* Modals - High z-index to appear above everything */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50">
            <TimetableModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              lesson={editingLesson}
              metadata={metadata}
              onSuccess={mutateTimetable}
            />
          </div>
        )}

        {isShareModalOpen && (
          <div className="fixed inset-0 z-50">
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              lessons={lessons}
              filters={filters}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Update helper functions to support theme-aware colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30';
    case 'ongoing': return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30';
    case 'completed': return 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500/30';
    case 'cancelled': return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30';
    case 'rescheduled': return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/30';
    default: return 'bg-gray-100 dark:bg-slate-500/20 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-500/30';
  }
};

const getLessonTypeColor = (type: string) => {
  switch (type) {
    case 'regular': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'revision': return 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'exam': return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400';
    case 'practical': return 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400';
    case 'field_trip': return 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    case 'makeup': return 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'extra': return 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
    default: return 'bg-gray-50 dark:bg-slate-500/10 text-gray-600 dark:text-slate-400';
  }
};

export default TimetablePage;
