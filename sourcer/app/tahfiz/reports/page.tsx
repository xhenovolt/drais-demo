'use client';

import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RefreshCw, Filter, Download, Settings } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface TahfizStudent {
  student_id: number;
  admission_no: string;
  first_name: string;
  last_name: string;
  gender: string;
  photo_url?: string;
  class_name: string;
  stream_name?: string;
  group_id?: number;
  group_name?: string;
  teacher_name?: string;
  total_records: number;
  completed_portions: number;
  avg_retention_score?: number;
  avg_marks?: number;
  presentations_made: number;
  eval_retention_score?: number;
  eval_tajweed_score?: number;
  eval_voice_score?: number;
  eval_discipline_score?: number;
  total_attendance_records: number;
  present_days: number;
  total_portions_assigned: number;
  portions_completed: number;
  portions_in_progress: number;
  books_studied?: string;
  term_name?: string;
  academic_year?: string;
  records: any[];
  evaluations: any[];
  portions: any[];
  attendance: any[];
}

// Context for syncing teacher initials across reports
const TeacherInitialsContext = createContext<any>(null);

const TahfizReportsPage = () => {
  const [allStudents, setAllStudents] = useState<TahfizStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    term: '',
    group: '',
    class: '',
    student: '',
    evaluation_type: '',
  });
  const [showCustomization, setShowCustomization] = useState(false);
  const [customTab, setCustomTab] = useState('school');
  const [dateRange, setDateRange] = useState('month');
  const [teacherInitials, setTeacherInitials] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const customizationRef = useRef<any>({});

  const schoolId = 1; // Replace with actual school ID

  // School info (can be made dynamic later)
  const schoolInfo = {
    name: 'EXCEL ISLAMIC NURSERY & PRIMARY SCHOOL',
    address: 'BUSEMBATIA, BUGWERI',
    po_box: 'P.O. BOX 144, BUSEMBATIA',
    logo_url: '/logo.png',
    contact: 'Tel: 0706 074 179 / 0785 680 091 / 0701 962 984',
    center_no: 'UNEB CENTRE No: TBD',
    registration_no: 'Reg no: TBD',
    arabic_name: 'مدرسة إكسيل الإسلامية للروضة والابتدائية',
    arabic_address: 'بوسيمباتيا، بوغويري',
    arabic_contact: 'هاتف: 0706 074 179 / 0785 680 091 / 0701 962 984',
    arabic_center_no: 'رقم مركز الامتحانات (UNEB): سيحدد لاحقاً',
    arabic_registration_no: 'رقم التسجيل: سيحدد لاحقاً',
  };

  // Arabic digits converter
  const toArabicDigits = (input?: string | number | null) => {
    if (input === null || input === undefined) return '';
    const s = String(input);
    const cleaned = s.replace(/[-–—‑]/g, '');
    const map: Record<string, string> = {
      '0': '٠',
      '1': '١',
      '2': '٢',
      '3': '٣',
      '4': '٤',
      '5': '٥',
      '6': '٦',
      '7': '٧',
      '8': '٨',
      '9': '٩',
    };
    return cleaned.replace(/[0-9]/g, (d) => map[d]);
  };

  // Fetch data with auto-refresh every 30 seconds
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const queryParams = new URLSearchParams({
        school_id: schoolId.toString(),
        ...(filters.term && { term_id: filters.term }),
        ...(filters.class && { class_id: filters.class }),
        ...(filters.group && { group_id: filters.group }),
        ...(filters.student && { student_id: filters.student }),
      });

      const response = await fetch(`/api/tahfiz/reports?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setAllStudents(data.data || []);
      } else {
        console.error('Failed to fetch data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [filters]);

  // Group students by class
  const classGroups = useMemo(() => {
    const groups: Record<string, { className: string; students: TahfizStudent[] }> = {};

    allStudents.forEach((student) => {
      const className = student.class_name || 'Unknown Class';
      if (!groups[className]) {
        groups[className] = { className, students: [] };
      }
      groups[className].students.push(student);
    });

    // Sort students within each class by name
    Object.values(groups).forEach((g) => {
      g.students.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
    });

    return groups;
  }, [allStudents]);

  // Filter students based on search criteria
  const filteredClassGroups = useMemo(() => {
    let groups = JSON.parse(JSON.stringify(classGroups));

    if (filters.class) {
      groups = Object.fromEntries(
        Object.entries(groups).filter(([_, v]) =>
          String(v.className).toLowerCase().includes(filters.class.toLowerCase())
        )
      );
    }

    Object.values(groups).forEach((g: any) => {
      g.students = g.students.filter((s: TahfizStudent) => {
        // Group filter
        if (filters.group && (!s.group_name || !s.group_name.toLowerCase().includes(filters.group.toLowerCase()))) {
          return false;
        }

        // Student name/ID filter
        if (filters.student) {
          const name = `${s.first_name} ${s.last_name}`.toLowerCase();
          if (!name.includes(filters.student.toLowerCase()) && String(s.student_id) !== filters.student) {
            return false;
          }
        }

        return true;
      });
    });

    // Remove empty classes
    groups = Object.fromEntries(Object.entries(groups).filter(([_, v]) => (v as any).students.length > 0));
    return groups;
  }, [classGroups, filters]);

  // Calculate positions within class
  const classGroupsWithPositions = useMemo(() => {
    const groups = JSON.parse(JSON.stringify(filteredClassGroups));

    Object.values(groups).forEach((classGroup: any) => {
      // Calculate scores for ranking
      classGroup.students.forEach((student: TahfizStudent) => {
        const retentionScore = student.avg_retention_score || student.eval_retention_score || 0;
        const marksScore = student.avg_marks || 0;
        const completionRate =
          student.total_portions_assigned > 0
            ? (student.portions_completed / student.total_portions_assigned) * 100
            : 0;
        const attendanceRate =
          student.total_attendance_records > 0 ? (student.present_days / student.total_attendance_records) * 100 : 0;

        // Overall Tahfiz score (weighted average)
        student.overallScore =
          retentionScore * 0.4 + marksScore * 0.3 + completionRate * 0.2 + attendanceRate * 0.1;
        student.completionRate = completionRate;
        student.attendanceRate = attendanceRate;
      });

      // Sort by overall score (highest first)
      classGroup.students.sort((a: any, b: any) => {
        return (b.overallScore || 0) - (a.overallScore || 0);
      });

      // Assign positions
      classGroup.students.forEach((student: any, index: number) => {
        student.position = index + 1;
        student.totalInClass = classGroup.students.length;
      });
    });

    return groups;
  }, [filteredClassGroups]);

  // Helper functions for grades and performance
  const getTahfizGrade = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 70) return '#3B82F6'; // Blue
    if (score >= 60) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  // Inline styles (preserved from original design)
  const styles = {
    reportPage: {
      pageBreakAfter: 'always',
      background: '#fff',
      boxShadow: '0 2px 8px #e6f0fa',
      padding: '16px 18px',
      borderRadius: 8,
      maxWidth: 900,
      margin: '0 auto 40px',
      fontSize: 14,
      fontFamily: "'Segoe UI', sans-serif",
    } as React.CSSProperties,
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 10,
      opacity: 0.8,
      marginBottom: 0,
      marginTop: 0,
    } as React.CSSProperties,
    blueBanner: {
      backgroundColor: 'rgb(34, 139, 34)',
      color: 'white',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
      padding: 8,
      marginTop: 8,
      marginBottom: 4,
    } as React.CSSProperties,
    grayRibbon: {
      position: 'relative',
      background: 'linear-gradient(to right, #d3d3d3, #a9a9a9)',
      color: '#000',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 18,
      padding: 4,
      marginTop: 4,
      marginBottom: 20,
      marginLeft: '15%',
      marginRight: '15%',
      maxWidth: '70%',
      justifyContent: 'center',
    } as React.CSSProperties,
    studentPhoto: {
      width: 100,
      height: 115,
      objectFit: 'cover',
      marginRight: 20,
      border: '2px solid #eee',
    } as React.CSSProperties,
    studentInfoContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: '2rem',
      marginBottom: 0,
      paddingBottom: 0,
      borderBottom: '2px dashed #000',
      fontSize: 18,
    } as React.CSSProperties,
    studentValue: {
      color: '#d61515ff',
      fontStyle: 'italic',
      fontWeight: 'bolder',
    } as React.CSSProperties,
    tahfizTable: {
      borderCollapse: 'collapse' as any,
      width: '100%',
      marginTop: 20,
      fontSize: 14,
    },
    tahfizTh: {
      border: '1px solid black',
      padding: 8,
      textAlign: 'center' as any,
      background: '#f0f8ff',
      fontWeight: 'bold',
    },
    tahfizTd: {
      border: '1px solid black',
      padding: 8,
      textAlign: 'center' as any,
    },
    studentInfoBox: {
      border: '2px solid #1a4be7',
      borderRadius: 10,
      padding: '18px 16px',
      margin: '18px 0 18px 0',
      background: '#f8faff',
      boxShadow: '0 1px 6px #e6f0fa',
    } as React.CSSProperties,
  };

  // Function to handle inline editing of teacher initials
  const handleInitialsChange = (classId: string, subjectId: string, newInitials: string) => {
    setTeacherInitials((prev) => ({
      ...prev,
      [`${classId}-${subjectId}`]: newInitials,
    }));
  };

  // Function to persist initials to the backend
  const saveInitialsToBackend = async (classId: string, subjectId: string, newInitials: string) => {
    setSaving(true);
    try {
      await fetch('/api/teacher-initials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, subjectId, initials: newInitials }),
      });
    } catch (error) {
      console.error('Failed to save initials:', error);
    } finally {
      setSaving(false);
    }
  };

  // Export reports to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    Object.values(classGroupsWithPositions).forEach((classGroup: any) => {
      doc.text(`${classGroup.className} - Tahfiz Reports`, 10, 10);
      autoTable(doc, {
        head: [['Student Name', 'Teacher Initials', 'Retention Score', 'Tajweed Score']],
        body: classGroup.students.map((student: any) => [
          `${student.first_name} ${student.last_name}`,
          teacherInitials[`${student.class_id}-${student.subject_id}`] || student.teacher_initials || 'N/A',
          `${student.avg_retention_score || 0}%`,
          `${student.eval_tajweed_score || 0}%`,
        ]),
      });
      doc.addPage();
    });
    doc.save('TahfizReports.pdf');
  };

  // Export reports to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    Object.values(classGroupsWithPositions).forEach((classGroup: any) => {
      const worksheetData = [
        ['Student Name', 'Teacher Initials', 'Retention Score', 'Tajweed Score'],
        ...classGroup.students.map((student: any) => [
          `${student.first_name} ${student.last_name}`,
          teacherInitials[`${student.class_id}-${student.subject_id}`] || student.teacher_initials || 'N/A',
          `${student.avg_retention_score || 0}%`,
          `${student.eval_tajweed_score || 0}%`,
        ]),
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, classGroup.className);
    });
    XLSX.writeFile(workbook, 'TahfizReports.xlsx');
  };

  return (
    <TeacherInitialsContext.Provider value={{ teacherInitials, handleInitialsChange }}>
      <div className="p-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Tahfiz Reports</h1>
            <p className="text-slate-600 mt-1">Generate and view comprehensive progress reports</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            onClick={exportToPDF}
          >
            <Download className="w-5 h-5" />
            <span>Export to PDF</span>
          </motion.button>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-700">Filters:</span>
          </div>

          <select
            value={filters.term}
            onChange={(e) => setFilters((f) => ({ ...f, term: e.target.value }))}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Terms</option>
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>

          <select
            value={filters.group}
            onChange={(e) => setFilters((f) => ({ ...f, group: e.target.value }))}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Groups</option>
            {[...new Set(allStudents.map((s) => s.group_name).filter(Boolean))].map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <select
            value={filters.class}
            onChange={(e) => setFilters((f) => ({ ...f, class: e.target.value }))}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Classes</option>
            {[...new Set(allStudents.map((s) => s.class_name).filter(Boolean))].map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>

          <input
            value={filters.student}
            onChange={(e) => setFilters((f) => ({ ...f, student: e.target.value }))}
            placeholder="Search student name or ID"
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
          />

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={() => setShowCustomization(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* Date Range and Report Type Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="term">This Term</option>
              <option value="year">This Year</option>
            </select>
            <select className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
              <option value="">All Groups</option>
            </select>
            <select className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
              <option value="">All Teachers</option>
            </select>
            <select className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
              <option value="">Report Type</option>
              <option value="progress">Progress Report</option>
              <option value="attendance">Attendance Report</option>
              <option value="performance">Performance Report</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && allStudents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-slate-600">Total Students</h3>
              <p className="text-2xl font-bold text-slate-800">{allStudents.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-slate-600">Avg. Retention Score</h3>
              <p className="text-2xl font-bold text-emerald-600">
                {(
                  allStudents.reduce((sum, s) => sum + (s.avg_retention_score || 0), 0) / allStudents.length
                ).toFixed(1)}
                %
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-slate-600">Avg. Completion Rate</h3>
              <p className="text-2xl font-bold text-blue-600">
                {(
                  allStudents.reduce(
                    (sum, s) => sum + ((s.portions_completed / Math.max(s.total_portions_assigned, 1)) * 100 || 0),
                    0
                  ) / allStudents.length
                ).toFixed(1)}
                %
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-slate-600">Active Groups</h3>
              <p className="text-2xl font-bold text-purple-600">
                {[...new Set(allStudents.map((s) => s.group_id).filter(Boolean))].length}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-slate-600">Loading Tahfiz reports...</span>
          </div>
        )}

        {/* Reports */}
        <div>
          {Object.values(classGroupsWithPositions).map((classGroup: any) => (
            <div key={classGroup.className}>
              <div className="text-2xl font-bold text-center my-8 text-slate-800">
                {classGroup.className} - Tahfiz Reports
              </div>

              {classGroup.students.map((student: TahfizStudent) => (
                <div key={`${student.student_id}-${Date.now()}`} style={styles.reportPage}>
                  {/* Header */}
                  <div style={styles.header}>
                    <div className="text-left" style={{ direction: 'ltr', textAlign: 'left', flex: 1 }}>
                      <h2 className="text-xl font-bold">{schoolInfo.name}</h2>
                      <p>{schoolInfo.address}</p>
                      <p>{schoolInfo.contact}</p>
                      <p>{schoolInfo.center_no}</p>
                      <p>{schoolInfo.registration_no}</p>
                    </div>
                    <div className="text-center" style={{ flex: 'none' }}>
                      <Image src={schoolInfo.logo_url} alt="School Logo" width={90} height={90} />
                    </div>
                    <div className="text-right font-bold text-xl" style={{ direction: 'rtl', textAlign: 'right', flex: 1 }}>
                      <h1 className="text-xl font-bold">{schoolInfo.arabic_name}</h1>
                      <p>{schoolInfo.arabic_address}</p>
                      <p>{toArabicDigits(schoolInfo.arabic_contact)}</p>
                      <p>UNEB: {toArabicDigits(schoolInfo.arabic_center_no)}</p>
                      <p>Reg: {toArabicDigits(schoolInfo.arabic_registration_no)}</p>
                    </div>
                  </div>

                  {/* Banner */}
                  <div style={styles.blueBanner}>
                    TAHFIZ PROGRESS REPORT - {student.term_name || 'CURRENT TERM'}
                  </div>

                  {/* Student Info */}
                  <div style={styles.studentInfoBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <Image
                        src={student.photo_url || '/logo.png'}
                        alt={`${student.first_name} ${student.last_name}`}
                        width={100}
                        height={115}
                        style={styles.studentPhoto}
                        className="object-cover"
                      />
                      <div style={{ flex: 1 }}>
                        <div style={styles.studentInfoContainer}>
                          <p style={{ margin: 0, padding: 0 }}>
                            <span className="font-bold">Name:</span>
                            <span style={styles.studentValue}>
                              {' '}
                              {student.first_name} {student.last_name}
                            </span>
                          </p>
                          <p style={{ margin: 0, padding: 0 }}>
                            <span className="font-bold">Gender:</span>
                            <span style={styles.studentValue}> {student.gender || '-'}</span>
                          </p>
                          <p style={{ margin: 0, padding: 0 }}>
                            <span className="font-bold">Class:</span>
                            <span style={styles.studentValue}> {student.class_name}</span>
                          </p>
                        </div>
                        <div style={styles.studentInfoContainer}>
                          <p style={{ margin: 0, padding: 0 }}>
                            <span className="font-bold">Student ID:</span>
                            <span style={styles.studentValue}> {student.student_id}</span>
                          </p>
                          <p style={{ margin: 0, padding: 0 }}>
                            <span className="font-bold">Group:</span>
                            <span style={styles.studentValue}> {student.group_name || 'No Group'}</span>
                          </p>
                          {/* <p style={{ margin: 0, padding: 0 }}>
                            <span className="font-bold">Position:</span>
                            <span style={styles.studentValue}>
                              {' '}
                              {student.position} of {student.totalInClass}
                            </span>
                          </p> */}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gray Ribbon */}
                  <div style={styles.grayRibbon}>Tahfiz Performance Assessment</div>

                  {/* Tahfiz Performance Table */}
                  <table style={styles.tahfizTable}>
                    <thead>
                      <tr>
                        <th style={styles.tahfizTh}>METRIC</th>
                        <th style={styles.tahfizTh}>SCORE</th>
                        <th style={styles.tahfizTh}>GRADE</th>
                        <th style={styles.tahfizTh}>REMARKS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.tahfizTd}>Retention Score</td>
                        {/* <td style={styles.tahfizTd}>{(student.avg_retention_score || student.eval_retention_score || 0).toFixed(1)}%</td> */}
                        <td
                          style={{
                            ...styles.tahfizTd,
                            color: getPerformanceColor(student.avg_retention_score || student.eval_retention_score || 0),
                            fontWeight: 'bold',
                          }}
                        >
                          {getTahfizGrade(student.avg_retention_score || student.eval_retention_score || 0)}
                        </td>
                        <td style={styles.tahfizTd}>Memory retention performance</td>
                      </tr>
                      <tr>
                        <td style={styles.tahfizTd}>Tajweed Score</td>
                        <td style={styles.tahfizTd}>{(student.eval_tajweed_score || 0).toFixed(1)}%</td>
                        <td
                          style={{
                            ...styles.tahfizTd,
                            color: getPerformanceColor(student.eval_tajweed_score || 0),
                            fontWeight: 'bold',
                          }}
                        >
                          {getTahfizGrade(student.eval_tajweed_score || 0)}
                        </td>
                        <td style={styles.tahfizTd}>Recitation rules accuracy</td>
                      </tr>
                      <tr>
                        <td style={styles.tahfizTd}>Voice & Pronunciation</td>
                        <td style={styles.tahfizTd}>{(student.eval_voice_score || 0).toFixed(1)}%</td>
                        <td
                          style={{
                            ...styles.tahfizTd,
                            color: getPerformanceColor(student.eval_voice_score || 0),
                            fontWeight: 'bold',
                          }}
                        >
                          {getTahfizGrade(student.eval_voice_score || 0)}
                        </td>
                        <td style={styles.tahfizTd}>Voice quality and pronunciation</td>
                      </tr>
                      <tr>
                        <td style={styles.tahfizTd}>Discipline & Conduct</td>
                        <td style={styles.tahfizTd}>{(student.eval_discipline_score || 0).toFixed(1)}%</td>
                        <td
                          style={{
                            ...styles.tahfizTd,
                            color: getPerformanceColor(student.eval_discipline_score || 0),
                            fontWeight: 'bold',
                          }}
                        >
                          {getTahfizGrade(student.eval_discipline_score || 0)}
                        </td>
                        <td style={styles.tahfizTd}>Behavior and attitude</td>
                      </tr>
                      <tr>
                        <td style={styles.tahfizTd}>Portions Completed</td>
                        <td style={styles.tahfizTd}>
                          {student.portions_completed}/{student.total_portions_assigned}
                        </td>
                        <td
                          style={{
                            ...styles.tahfizTd,
                            color: getPerformanceColor(student.completionRate || 0),
                            fontWeight: 'bold',
                          }}
                        >
                          {getTahfizGrade(student.completionRate || 0)}
                        </td>
                        <td style={styles.tahfizTd}>Memorization progress</td>
                      </tr>
                      <tr>
                        <td style={styles.tahfizTd}>Attendance Rate</td>
                        <td style={styles.tahfizTd}>{(student.attendanceRate || 0).toFixed(1)}%</td>
                        <td
                          style={{
                            ...styles.tahfizTd,
                            color: getPerformanceColor(student.attendanceRate || 0),
                            fontWeight: 'bold',
                          }}
                        >
                          {getTahfizGrade(student.attendanceRate || 0)}
                        </td>
                        <td style={styles.tahfizTd}>Class attendance consistency</td>
                      </tr>
                      <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                        <td style={styles.tahfizTd}>OVERALL PERFORMANCE</td>
                        <td style={styles.tahfizTd}>{(student.overallScore || 0).toFixed(1)}%</td>
                        <td
                          style={{
                            ...styles.tahfizTd,
                            color: getPerformanceColor(student.overallScore || 0),
                            fontWeight: 'bold',
                          }}
                        >
                          {getTahfizGrade(student.overallScore || 0)}
                        </td>
                        <td style={styles.tahfizTd}>Comprehensive assessment</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Progress Summary */}
                  <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1a4be7', fontWeight: 'bold' }}>Memorization Progress</h4>
                      <p>
                        <strong>Books Studied:</strong> {student.books_studied || 'Quran'}
                      </p>
                      <p>
                        <strong>Portions Assigned:</strong> {student.total_portions_assigned}
                      </p>
                      <p>
                        <strong>Portions Completed:</strong> {student.portions_completed}
                      </p>
                      <p>
                        <strong>In Progress:</strong> {student.portions_in_progress}
                      </p>
                      <p>
                        <strong>Presentations Made:</strong> {student.presentations_made}
                      </p>
                    </div>
                    <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1a4be7', fontWeight: 'bold' }}>Teacher & Group Info</h4>
                      <p>
                        <strong>Teacher:</strong> {student.teacher_name || 'Not Assigned'}
                      </p>
                      <p>
                        <strong>Group:</strong> {student.group_name || 'No Group'}
                      </p>
                      <p>
                        <strong>Class Rank:</strong> {student.position} out of {student.totalInClass}
                      </p>
                      <p>
                        <strong>Academic Year:</strong> {student.academic_year || 'Current'}
                      </p>
                      <p>
                        <strong>Term:</strong> {student.term_name || 'Current'}
                      </p>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div style={{ marginTop: 30, borderTop: '2px dashed #999', paddingTop: 15 }}>
                    <h4 style={{ marginBottom: 15 }}>Comments/Remarks</h4>
                    <div style={{ marginBottom: 10 }}>
                      <span
                        style={{
                          background: 'rgb(145, 140, 140)',
                          color: '#000',
                          fontWeight: 'bold',
                          padding: '4px 18px 4px 10px',
                          borderRadius: '4px',
                          marginRight: 18,
                        }}
                      >
                        Teacher&apos;s Comment:
                      </span>
                      <span
                        style={{
                          color: '#1a4be7',
                          fontStyle: 'italic',
                          borderBottom: '1.5px dashed #1a4be7',
                        }}
                      >
                        {student.overallScore >= 80
                          ? 'Excellent Tahfiz progress! Keep up the outstanding work.'
                          : student.overallScore >= 70
                          ? 'Good progress in memorization. Continue with dedication.'
                          : student.overallScore >= 60
                          ? 'Satisfactory performance. More focus needed on retention.'
                          : 'Needs significant improvement. Please see teacher for guidance.'}
                      </span>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <span
                        style={{
                          background: 'rgb(145, 140, 140)',
                          color: '#000',
                          fontWeight: 'bold',
                          padding: '4px 18px 4px 10px',
                          borderRadius: '4px',
                          marginRight: 18,
                        }}
                      >
                        Parent&apos;s Signature:
                      </span>
                      <span
                        style={{
                          borderBottom: '1.5px dashed #1a4be7',
                          display: 'inline-block',
                          minWidth: 200,
                        }}
                      >
                        &nbsp;
                      </span>
                    </div>
                    <div style={{ textDecoration: 'underline dashed', marginTop: 12 }}>
                      Next Term Begins: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && Object.keys(filteredClassGroups).length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Tahfiz Reports Found</h3>
            <p className="text-slate-600 mb-6">
              No students match your current filter criteria, or no Tahfiz data is available yet.
            </p>
            <button
              onClick={() => setFilters({ term: '', group: '', class: '', student: '', evaluation_type: '' })}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Customization Modal (preserved from original) */}
        {showCustomization && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
              <button className="absolute top-2 right-2 text-2xl" onClick={() => setShowCustomization(false)}>
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Customize Tahfiz Report Style</h2>
              <div className="mb-4 flex gap-2 border-b">
                {['school', 'banner', 'table', 'comment'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-1 ${
                      customTab === tab ? 'border-b-2 border-blue-600 font-semibold' : ''
                    }`}
                    onClick={() => setCustomTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <form>
                {customTab === 'school' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block font-semibold mb-1">School Name</label>
                      <input type="text" className="w-full border rounded px-2 py-1" defaultValue={schoolInfo.name} />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">School Address</label>
                      <input type="text" className="w-full border rounded px-2 py-1" defaultValue={schoolInfo.address} />
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    type="button"
                    onClick={() => setShowCustomization(false)}
                  >
                    Apply Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style jsx global>{`
          @media print {
            .no-print {
              display: none !important;
            }
            img {
              max-width: 100px !important;
              max-height: 115px !important;
            }
          }
        `}</style>
      </div>
    </TeacherInitialsContext.Provider>
  );
};

export default TahfizReportsPage;
