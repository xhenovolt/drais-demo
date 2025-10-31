"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Search, Filter, Download, Upload, 
  Users, GraduationCap, Star, Mosque, Sparkles,
  Eye, Edit, Trash2, MoreVertical, ChevronDown
} from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import Swal from 'sweetalert2';

interface TheologyClass {
  id: number;
  name: string;
  students_count?: number;
}

interface TheologyStudent {
  id: number;
  first_name: string;
  last_name: string;
  admission_no: string;
  photo_url?: string;
}

interface TheologyResult {
  id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  subject_name: string;
  score: number;
  grade: string;
  term_name: string;
  class_name: string;
}

export default function TheologyResultsManager() {
  const [selectedTheologyClass, setSelectedTheologyClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [bulkScore, setBulkScore] = useState('');

  // Fetch theology classes
  const { data: theologyClasses = [] } = useSWR<TheologyClass[]>(
    '/api/classes?type=theology',
    fetcher
  );

  // Fetch terms
  const { data: terms = [] } = useSWR('/api/terms', fetcher);

  // Fetch theology subjects
  const { data: theologySubjects = [] } = useSWR(
    '/api/subjects?type=theology',
    fetcher
  );

  // Fetch theology results
  const { data: resultsData, mutate: mutateResults } = useSWR(
    selectedTheologyClass && selectedTerm 
      ? `/api/theology-results?class_id=${selectedTheologyClass}&term_id=${selectedTerm}`
      : null,
    fetcher
  );

  const theologyResults: TheologyResult[] = resultsData?.data || [];

  // Fetch students for selected theology class
  const { data: studentsData } = useSWR(
    selectedTheologyClass 
      ? `/api/students/full?theology_class_id=${selectedTheologyClass}`
      : null,
    fetcher
  );

  // Sort students alphabetically
  const sortedStudents = useMemo(() => {
    if (!studentsData?.data) return [];
    return [...studentsData.data].sort((a, b) => 
      `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
    );
  }, [studentsData]);

  // Sort and filter results
  const filteredResults = useMemo(() => {
    let filtered = [...theologyResults];

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter(result => result.subject_name === selectedSubject);
    }

    // Sort alphabetically by student name
    return filtered.sort((a, b) => a.student_name.localeCompare(b.student_name));
  }, [theologyResults, searchTerm, selectedSubject]);

  const handleAddResult = async (studentId: number, score: number) => {
    if (!selectedSubject || !selectedTerm || !selectedTheologyClass) {
      Swal.fire('Error', 'Please select class, term, and subject first.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/theology-results/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          subject_id: selectedSubject,
          score: score,
          theology_class_id: selectedTheologyClass,
          term_id: selectedTerm,
          is_theology: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire('Success!', 'Theology result added successfully.', 'success');
        mutateResults();
        setShowAddModal(false);
        setSelectedStudents([]);
        setBulkScore('');
      } else {
        Swal.fire('Error!', result.error || 'Failed to add result.', 'error');
      }
    } catch (error) {
      Swal.fire('Error!', 'An unexpected error occurred.', 'error');
    }
  };

  const handleBulkAdd = async () => {
    if (selectedStudents.length === 0 || !bulkScore) {
      Swal.fire('Error', 'Please select students and enter a score.', 'error');
      return;
    }

    const score = parseFloat(bulkScore);
    if (isNaN(score) || score < 0 || score > 100) {
      Swal.fire('Error', 'Please enter a valid score (0-100).', 'error');
      return;
    }

    try {
      const promises = selectedStudents.map(studentId => 
        handleAddResult(studentId, score)
      );
      
      await Promise.all(promises);
      
      Swal.fire('Success!', `Added results for ${selectedStudents.length} students.`, 'success');
    } catch (error) {
      Swal.fire('Error!', 'Failed to add bulk results.', 'error');
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
            <Mosque className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Islamic Studies Assessment
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage Quranic and theology-based evaluations
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          disabled={!selectedTheologyClass || !selectedTerm}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add Theology Results
        </motion.button>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-md bg-white/40 dark:bg-slate-800/40 rounded-2xl p-6 shadow-lg border border-white/30 dark:border-slate-700/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Theology Class
            </label>
            <select
              value={selectedTheologyClass}
              onChange={(e) => setSelectedTheologyClass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Theology Class</option>
              {theologyClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Term</option>
              {terms.map((term: any) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Subject Filter
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Subjects</option>
              {theologySubjects.map((subject: any) => (
                <option key={subject.id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Search Students
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="backdrop-blur-md bg-white/40 dark:bg-slate-800/40 rounded-2xl shadow-lg border border-white/30 dark:border-slate-700/30 overflow-hidden">
        <div className="p-6 border-b border-white/20 dark:border-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 dark:text-white">
                Theology Results ({filteredResults.length})
              </h3>
            </div>
            {filteredResults.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Average: {(filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No Results Found
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              {!selectedTheologyClass || !selectedTerm 
                ? "Please select a theology class and term to view results."
                : "No theology results found for the selected criteria."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredResults.map((result, index) => (
                  <motion.tr
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                          {result.student_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-white">
                            {result.student_name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            #{result.admission_no}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <BookOpen className="w-4 h-4" />
                        {result.subject_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-800 dark:text-white">
                          {result.score}%
                        </span>
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${result.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(result.score)}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Results Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/30 w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-white/20 dark:border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Add Theology Results
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Select students and enter their theology assessment scores
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Subject Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select Theology Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Subject</option>
                    {theologySubjects.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bulk Score Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Bulk Score (Optional)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bulkScore}
                      onChange={(e) => setBulkScore(e.target.value)}
                      placeholder="Enter score for all selected students"
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      onClick={handleBulkAdd}
                      disabled={selectedStudents.length === 0 || !bulkScore || !selectedSubject}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                    >
                      Apply to Selected ({selectedStudents.length})
                    </button>
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800 dark:text-white">
                    Students in {theologyClasses.find(c => c.id.toString() === selectedTheologyClass)?.name}
                  </h4>
                  
                  {sortedStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">
                        No students found in the selected theology class.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {sortedStudents.map((student: any) => (
                        <motion.div
                          key={student.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            selectedStudents.includes(student.id)
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                              : 'border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 hover:border-emerald-300'
                          }`}
                          onClick={() => {
                            setSelectedStudents(prev =>
                              prev.includes(student.id)
                                ? prev.filter(id => id !== student.id)
                                : [...prev, student.id]
                            );
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                              {student.first_name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-800 dark:text-white">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                #{student.admission_no}
                              </div>
                            </div>
                            {selectedStudents.includes(student.id) && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
