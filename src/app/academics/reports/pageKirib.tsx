'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

// Add a PHP API base like in ResultTypesManager to avoid hitting a non-existent Next.js API route
const API_BASE = process.env.NEXT_PUBLIC_PHP_API_BASE || 'http://localhost/drais/api';

const ReportsPage = () => {
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [filters, setFilters] = useState({ term: '', resultType: '', classId: '', student: '' });
  const [loading, setLoading] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customTab, setCustomTab] = useState('school');
  const customizationRef = useRef<any>({});

  // School info (static for all reports)
  const schoolInfo = {
    name: 'KIRIBAKI SECONDARY SCHOOL',
    address: 'CMS, IGANGA',
    po_box: '',
    logo_url: '/schoollogo.png',
    contact: 'Tel: 0776004141',
    center_no: '',
    registration_no: '',
  };

  useEffect(() => {
    setLoading(true);
    // Use new DB (Next.js API)
    fetch(`/api/reports/list`)
      .then(async r => {
        const data = await r.json().catch(() => ({}));
        return data;
      })
      .then((data:any) => {
        const students = data?.students || [];
        const results = data?.results || data?.data || (Array.isArray(data) ? data : []);
        setAllStudents(students);
        setAllResults(results);
      })
      .catch(() => {
        setAllStudents([]);
        setAllResults([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Enhanced class groups with data validation and error checking
  const classGroups = useMemo(() => {
    const groups: Record<string, { className: string, students: any[] }> = {};
    
    // Filter out invalid results and remove duplicates
    const validResults = allResults.filter((r, index, arr) => {
      // Basic validation
      if (!r.student_id || !r.class_name || r.score === null || r.score === undefined) {
        return false;
      }
      
      // Ensure score is a valid number
      const score = parseFloat(r.score);
      if (isNaN(score)) return false;
      
      // Remove duplicates based on unique combination
      const key = `${r.student_id}_${r.subject_id}_${r.result_type_name || r.results_type}_${r.term || r.term_name || 'no_term'}`;
      const firstIndex = arr.findIndex(item => {
        const itemKey = `${item.student_id}_${item.subject_id}_${item.result_type_name || item.results_type}_${item.term || item.term_name || 'no_term'}`;
        return itemKey === key;
      });
      return firstIndex === index;
    });

    validResults.forEach(r => {
      const className = r.class_name || 'Unknown Class';
      if (!groups[className]) {
        groups[className] = { className, students: [] };
      }
      
      let student = groups[className].students.find(s => s.student_id === r.student_id);
      if (!student) {
        student = {
          student_id: r.student_id,
          admission_no: r.admission_no,
          first_name: r.first_name,
          last_name: r.last_name,
          class_name: r.class_name,
          gender: r.gender,
          stream_name: r.stream_name,
          results: [],
        };
        groups[className].students.push(student);
      }
      student.results.push(r);
    });
    
    // Sort students within each class by name
    Object.values(groups).forEach(g => {
      g.students.sort((a, b) => (a.last_name||'').localeCompare(b.last_name||''));
    });
    
    return groups;
  }, [allResults]);

  // Enhanced filtering logic with better validation
  const filteredClassGroups = useMemo(() => {
    let groups = JSON.parse(JSON.stringify(classGroups)); // Deep clone to avoid mutations
    
    if (filters.classId) {
      groups = Object.fromEntries(
        Object.entries(groups).filter(([_, v]) =>
          String(v.className).toLowerCase() === String(filters.classId).toLowerCase() ||
          v.students.some(s => String(s.class_name).toLowerCase() === String(filters.classId).toLowerCase())
        )
      );
    }
    
    Object.values(groups).forEach(g => {
      g.students = g.students.filter(s => {
        // Ensure student has valid results
        if (!s.results || s.results.length === 0) return false;
        
        // Term filter - only apply if term data exists
        if (filters.term) {
          const hasTermData = s.results.some((r: any) => r.term || r.term_name);
          if (hasTermData) {
            const matchesTerm = s.results.some((r: any) =>
              String(r.term || r.term_name || '').toLowerCase() === filters.term.toLowerCase()
            );
            if (!matchesTerm) return false;
          }
        }
        
        // Result type filter
        if (filters.resultType) {
          const matchesResultType = s.results.some((r: any) =>
            String(r.result_type_name || r.results_type || '').toLowerCase() === filters.resultType.toLowerCase()
          );
          if (!matchesResultType) return false;
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
    groups = Object.fromEntries(Object.entries(groups).filter(([_, v]) => v.students.length > 0));
    return groups;
  }, [classGroups, filters]);

  // Helper: check if a single result row matches current filters
  const matchesFilters = (r: any) => {
    if (filters.resultType) {
      const rt = String(r.result_type_name || r.results_type || '').toLowerCase();
      if (rt !== filters.resultType.toLowerCase()) return false;
    }
    if (filters.term) {
      const term = String(r.term || r.term_name || '').toLowerCase();
      if (term !== filters.term.toLowerCase()) return false;
    }
    return true;
  };

  // Enhanced class-based positioning with proper per-class ranking
  const classGroupsWithPositions = useMemo(() => {
    const groups: Record<string, { className: string; students: any[] }> = JSON.parse(JSON.stringify(filteredClassGroups));

    // Process each class independently for proper class-based positioning
    Object.values(groups).forEach((classGroup: any) => {
      // Filter results per student based on current filters
      classGroup.students.forEach((student: any) => {
        student.results = (student.results || []).filter((r: any) => {
          // Validate result data
          if (!r.score || isNaN(parseFloat(r.score))) return false;
          return matchesFilters(r);
        });
      });
      
      // Remove students with no valid results after filtering
      classGroup.students = classGroup.students.filter((s: any) => s.results && s.results.length > 0);
      
      // Calculate total marks for each student in this class
      classGroup.students.forEach((student: any) => {
        const validScores = (student.results || [])
          .map((r: any) => parseFloat(r.score || 0))
          .filter(score => !isNaN(score) && score >= 0);
        
        student.totalMarks = validScores.reduce((sum, score) => sum + score, 0);
        student.averageMarks = validScores.length > 0 ? Math.round(student.totalMarks / validScores.length) : 0;
        student.subjectCount = validScores.length;
      });
      
      // Sort students by total marks within this class (highest first)
      classGroup.students.sort((a: any, b: any) => {
        const totalA = a.totalMarks || 0;
        const totalB = b.totalMarks || 0;
        if (totalB !== totalA) return totalB - totalA;
        
        // If total marks are equal, sort by average
        const avgA = a.averageMarks || 0;
        const avgB = b.averageMarks || 0;
        if (avgB !== avgA) return avgB - avgA;
        
        // If still equal, sort by name
        return (a.last_name || '').localeCompare(b.last_name || '');
      });
      
      // Assign positions within this class only
      classGroup.students.forEach((student: any, index: number) => {
        student.position = index + 1;
        student.totalInClass = classGroup.students.length; // Class-specific total
      });
    });

    // Remove classes that have no students after processing
    Object.keys(groups).forEach((className) => {
      if (!groups[className].students.length) {
        delete groups[className];
      }
    });

    return groups;
  }, [filteredClassGroups, filters.term, filters.resultType]);

  // Helper functions for grades, division, etc.
  function getGrade(score: number) {
    if (score >= 90) return 'D1';
    if (score >= 80) return 'D2';
    if (score >= 70) return 'C3';
    if (score >= 60) return 'C4';
    if (score >= 55) return 'C5';
    if (score >= 50) return 'C6';
    if (score >= 40) return 'P8';
    return 'F9';
  }
  
  function getGradePoint(grade: string) {
    switch (grade) {
      case 'D1': return 1;
      case 'D2': return 2;
      case 'C3': return 3;
      case 'C4': return 4;
      case 'C5': return 5;
      case 'C6': return 6;
      case 'P8': return 8;
      case 'F9': return 9;
      default: return 9;
    }
  }
  
  function getDivision(aggregates: number) {
    if (aggregates <= 12) return 'Division 1';
    if (aggregates <= 24) return 'Division 2';
    if (aggregates <= 28) return 'Division 3';
    if (aggregates <= 32) return 'Division 4';
    return 'Division U';
  }
  
  function commentsForGrade(grade: string) {
    if (grade === 'D1') return 'Excellent results, keep it up.';
    if (grade === 'D2') return 'Very good score, but aim at excellency.';
    if (grade === 'C3') return 'Satisfactory performance, please work harder.';
    if (grade === 'C4') return 'Needs improvement, consider seeking help.';
    if (grade === 'C5') return 'Unsatisfactory, please see your teacher.';
    if (grade === 'C6') return 'Needs improvement, consider seeking help.';
    if (grade === 'P8') return 'Passed, but you can do better.';
    if (grade === 'F9') return 'Failed, please see your teacher for guidance.';
    return 'Continue working hard.';
  }

  // Helper to split results into principal and other subjects
  function splitSubjects(results: any[]) {
    const principal: any[] = [];
    const others: any[] = [];
    results.forEach(r => {
      const st = (r.subject_type ?? 'core').toLowerCase();
      if (st === 'core') principal.push(r);
      else others.push(r);
    });
    return { principal, others };
  }

  // Enhanced helper to group results by subject with better error handling
  function groupResultsBySubject(results: any[]) {
    const grouped: Record<string, any> = {};
    
    results.forEach((result) => {
      // Use subject_id and subject_name as fallback for grouping
      const subjectKey = result.subject_id || result.subject_name;
      if (!subjectKey) return; // Skip invalid results
      
      if (!grouped[subjectKey]) {
        grouped[subjectKey] = {
          subject_name: result.subject_name || `Subject ${subjectKey}`,
          teacher_name: result.teacher_name,
          midTermScore: null,
          endTermScore: null,
          regularScore: null,
        };
      }
      
      const resultType = (result.result_type_name || result.results_type || '').toLowerCase();
      if (resultType.includes('mid')) {
        grouped[subjectKey].midTermScore = parseFloat(result.score || 0);
      } else if (resultType.includes('end')) {
        grouped[subjectKey].endTermScore = parseFloat(result.score || 0);
      } else {
        // For other result types, use as regular score
        grouped[subjectKey].regularScore = parseFloat(result.score || 0);
      }
    });
    
    return Object.values(grouped).filter(item => item.subject_name); // Filter out invalid entries
  }

  // Inline style objects (mimic old CSS)
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
      backgroundColor: 'rgb(34, 139, 34)', // Change to green
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
      background: 'linear-gradient(to right, #d3d3d3, #a9a9a9)', // Add gradient
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
    studentDetails: {
      display: 'flex',
      gap: 5,
      marginBottom: 2,
      alignItems: 'center',
    } as React.CSSProperties,
    studentPhoto: {
      width: 100,
      height: 115,
      objectFit: 'cover',
      marginRight: 20,
      border: '2px solid #eee',
    } as React.CSSProperties,
    barcodeCard: {
      display: 'flex',
      flexDirection: 'row',
      padding: 0,
      margin: 0,
      gap: 2,
      alignItems: 'center',
    } as React.CSSProperties,
    barcodeImg: {
      width: 90,
      height: 40,
      marginRight: -30,
      marginLeft: -20,
      transform: 'rotate(270deg)',
    } as React.CSSProperties,
    barcodeVertical: {
      fontSize: 15,
      fontWeight: 500,
      margin: 0,
      transform: 'rotate(180deg)',
      writingMode: 'vertical-rl' as any,
    },
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
    comments: {
      marginTop: 30,
      borderTop: '2px dashed #999',
      paddingTop: 15,
    } as React.CSSProperties,
    commentRibbon: {
      display: 'inline-block',
      position: 'relative',
      background: 'rgb(145, 140, 140)',
      color: '#000',
      fontWeight: 'bold',
      padding: '4px 18px 4px 10px',
      borderRadius: '4px 0 0 4px',
      marginRight: 18,
      marginBottom: 8,
      fontSize: 14,
      borderTopRightRadius: '.4rem',
      borderBottomRightRadius: '.4rem',
    } as React.CSSProperties,
    commentText: {
      color: '#1a4be7',
      fontStyle: 'italic',
      borderBottom: '1.5px dashed #1a4be7',
      textDecoration: 'none',
      display: 'inline',
      marginBottom: 0,
      padding: 0,
    } as React.CSSProperties,
    gradeTable: {
      marginTop: 20,
      width: '100%',
      borderCollapse: 'collapse' as any,
      fontSize: 13,
    },
    gradeTh: {
      background: '#f0f0f0',
      border: '1px solid #04081a',
      textAlign: 'center' as any,
      padding: 6,
    },
    gradeTd: {
      border: '1px solid #04081a',
      textAlign: 'center' as any,
      padding: 6,
    },
    studentTable: {
      borderCollapse: 'collapse' as any,
      width: '100%',
      marginTop: 10,
      fontSize: 14,
    },
    studentTh: {
      border: '1px solid black',
      padding: 6,
      textAlign: 'center' as any,
      background: '#f0f8ff',
    },
    studentTd: {
      border: '1px solid black',
      padding: 6,
      textAlign: 'center' as any,
    },
  };

  // Comments section as a component
  function CommentsSection({ student }: { student: any }) {
    return (
      <div style={{ marginTop: '1%' }}>
        Comments/Remarks
        <div style={{ marginTop: 2 }}>
          <div style={{ marginBottom: 10, width: '100%' }}>
            <span style={styles.commentRibbon}>Class Teacher's Comment:</span>
            <span style={styles.commentText}>{student.class_teacher_comment || 'Brilliant!! all my hopes are in you.'}</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <span style={styles.commentRibbon}>DOS Comment:</span>
            <span style={styles.commentText}>{student.dos_comment || 'Outstanding Results, keep focused.'}</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <span style={styles.commentRibbon}>Headteacher's Comment:</span>
            <span style={styles.commentText}>{student.headteacher_comment || 'Great work done, keep it up.'}</span>
          </div>
          <div style={{ textDecoration: 'underline dashed', marginTop: 12 }}>18-AUG-2025</div>
          <div style={{ textDecoration: 'underline dashed', marginTop: 5 }}>Next Term Begins</div>
        </div>
      </div>
    );
  }

  // Grade table as a component
  function GradeTable() {
    return (
      <div style={styles.gradeTable}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <th style={styles.gradeTh}>GRADE</th>
              <th style={styles.gradeTh}>D1</th>
              <th style={styles.gradeTh}>D2</th>
              <th style={styles.gradeTh}>C3</th>
              <th style={styles.gradeTh}>C4</th>
              <th style={styles.gradeTh}>C5</th>
              <th style={styles.gradeTh}>C6</th>
              <th style={styles.gradeTh}>P7</th>
              <th style={styles.gradeTh}>P8</th>
              <th style={styles.gradeTh}>F9</th>
            </tr>
            <tr>
              <td style={styles.gradeTd}>SCORE RANGE</td>
              <td style={styles.gradeTd}>90–100</td>
              <td style={styles.gradeTd}>80–89</td>
              <td style={styles.gradeTd}>70–79</td>
              <td style={styles.gradeTd}>60–69</td>
              <td style={styles.gradeTd}>55–59</td>
              <td style={styles.gradeTd}>50–54</td>
              <td style={styles.gradeTd}>45–49</td>
              <td style={styles.gradeTd}>40–44</td>
              <td style={styles.gradeTd}>0–39</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Helper to calculate mid-term and end-of-term marks
  function calculateMarks(result: any) {
    const isEndOfTerm = result.result_type_name?.toLowerCase() === 'end of term';
    const midTermMarks = isEndOfTerm ? Math.floor((result.mid_term_score || 0) / 100 * 40) : Math.floor(result.score || 0);
    const endOfTermMarks = isEndOfTerm ? Math.floor((result.end_term_score || 0) / 100 * 60) : 0;
    const totalMarks = midTermMarks + endOfTermMarks;
    return { midTermMarks, endTermMarks, totalMarks };
  }

  return (
    <div className="p-4">
      {/* Filter Section at the top */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select value={filters.term} onChange={e => setFilters(f => ({ ...f, term: e.target.value }))} className="border rounded px-2 py-1">
          <option value="">All Terms</option>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>
        <select value={filters.resultType} onChange={e => setFilters(f => ({ ...f, resultType: e.target.value }))} className="border rounded px-2 py-1">
          <option value="">All Result Types</option>
          {/* Use result_type_name (fallback to results_type) from API */}
          {[...new Set(allResults.map((r:any) => r.result_type_name || r.results_type))].filter(Boolean).map((rt:string) =>
            <option key={rt} value={rt}>{rt}</option>
          )}
        </select>
        <select value={filters.classId} onChange={e => setFilters(f => ({ ...f, classId: e.target.value }))} className="border rounded px-2 py-1">
          <option value="">All Classes</option>
          {/* Fallback to class names from results if students list is empty */}
          {[...new Set(
            (allStudents.length ? allStudents.map((s:any)=> s.class_name || s.class_id) : allResults.map((r:any)=> r.class_name))
          )].filter(Boolean).map((cid:string) => {
            const label = allStudents.length
              ? (allStudents.find((s:any)=> (s.class_name || s.class_id) === cid)?.class_name || cid)
              : cid;
            const value = String(cid);
            return <option key={value} value={value}>{label}</option>;
          })}
        </select>
        <input value={filters.student} onChange={e => setFilters(f => ({ ...f, student: e.target.value }))} placeholder="Type student name or ID" className="border rounded px-2 py-1" />
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded">Print</button>
        <button onClick={() => setShowCustomization(true)} className="px-4 py-2 bg-green-700 text-white rounded">Customize Style</button>
      </div>
      {loading && <div>Loading..</div>}
      <div>
        {Object.values(classGroupsWithPositions).map((classGroup: any) => (
          <div key={classGroup.className}>
            <div className="text-2xl font-bold text-center my-8">{classGroup.className}</div>
            {classGroup.students.map((student: any) => {
              const { principal } = splitSubjects(student.results || []);
              const groupedResults = groupResultsBySubject(principal);
              const isEndOfTerm = principal.some((r: any) => (r.result_type_name || r.results_type || '').toLowerCase().includes('end'));
              
              // Enhanced calculations with better error handling
              const totalMarks = groupedResults.reduce((sum, r) => {
                let marks = 0;
                if (isEndOfTerm) {
                  const midTermMarks = r.midTermScore ? Math.floor((r.midTermScore / 100) * 40) : 0;
                  const endTermMarks = r.endTermScore ? Math.floor((r.endTermScore / 100) * 60) : 0;
                  marks = midTermMarks + endTermMarks;
                } else {
                  marks = r.regularScore || r.midTermScore || r.endTermScore || 0;
                }
                return sum + marks;
              }, 0);
              
              const averageMarks = groupedResults.length > 0 ? Math.floor(totalMarks / groupedResults.length) : 0;
              
              const aggregates = groupedResults.reduce((sum, r) => {
                let marks = 0;
                if (isEndOfTerm) {
                  const midTermMarks = r.midTermScore ? Math.floor((r.midTermScore / 100) * 40) : 0;
                  const endTermMarks = r.endTermScore ? Math.floor((r.endTermScore / 100) * 60) : 0;
                  marks = midTermMarks + endTermMarks;
                } else {
                  marks = r.regularScore || r.midTermScore || r.endTermScore || 0;
                }
                return sum + getGradePoint(getGrade(marks));
              }, 0);
              
              const division = getDivision(aggregates);

              return (
                <div key={student.student_id} style={styles.reportPage}>
                  {/* Header */}
                  <div style={styles.header}>
                    <div className="text-left ltr:text-left rtl:text-right" style={{ direction: 'ltr', textAlign: 'left', flex: 1 }}>
                      <h2 className="text-xl font-bold">{schoolInfo.name}</h2>
                      <p>{schoolInfo.address}</p>
                      <p>{schoolInfo.contact}</p>
                      <p>{schoolInfo.center_no}</p>
                      <p>{schoolInfo.registration_no}</p>
                    </div>
                    <div className="text-center" style={{ flex: 'none' }}>
                      <Image src={schoolInfo.logo_url} alt="School Logo" width={90} height={90} />
                    </div>
                  </div>
                  {/* Banner */}
                  <div style={styles.blueBanner}>
                    {(principal[0]?.result_type_name || 'MID TERM').toUpperCase()} REPORT
                  </div>
                  {/* Student Info */}
                  <div style={styles.studentDetails}>
                    <div style={styles.barcodeCard}>
                      <img src={`/api/barcode?id=${student.student_id}`} style={styles.barcodeImg as any} alt="Barcode" />
                      <span style={styles.barcodeVertical}>{student.student_id}</span>
                    </div>
                    <Image src={student.photo_passport || '/schoollogo.png'} alt="Student" width={100} height={115} style={styles.studentPhoto} />
                    <div>
                      <div style={styles.studentInfoContainer}>
                        <p style={{ margin: 0, padding: 0 }}>
                          <span className="font-bold" style={{ color: '#000' }}>Name:</span>
                          <span style={styles.studentValue}> {student.first_name} {student.last_name}</span>
                        </p>
                        <p style={{ margin: 0, padding: 0 }}>
                          <span className="font-bold" style={{ color: '#000' }}>Gender:</span>
                          <span style={styles.studentValue}> {student.gender || '-'}</span>
                        </p>
                        <p style={{ margin: 0, padding: 0 }}>
                          <span className="font-bold" style={{ color: '#000' }}>Class:</span>
                          <span style={styles.studentValue}> {student.class_name}</span>
                        </p>
                        <p style={{ margin: 0, padding: 0 }}>
                          <span className="font-bold" style={{ color: '#000' }}>Stream:</span>
                          <span style={styles.studentValue}> {student.stream_name || 'A'}</span>
                        </p>
                        <p style={{ margin: 0, padding: 0 }}>
                          <span className="font-bold" style={{ color: '#000' }}>Position:</span>
                          <span style={styles.studentValue}> {student.position} out of {student.totalInClass}</span>
                        </p>
                      </div>
                      <div style={styles.studentInfoContainer}>
                        <p style={{ margin: 0, padding: 0 }}>
                          <span className="font-bold" style={{ color: '#000' }}>Student No:</span>
                          <span style={styles.studentValue}> {student.student_id}</span>
                        </p>
                        <p style={{ margin: 0, padding: 0 }}>
                          <span className="font-bold" style={{ color: '#000' }}>Term:</span>
                          <span style={styles.studentValue}> {principal[0]?.term_name || principal[0]?.term || ''}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Gray Ribbon */}
                  <div style={styles.grayRibbon}>Principal Subjects Comprising the General Assessment</div>
                  {/* Subjects Table */}
                  <table style={styles.studentTable}>
                    <thead>
                      <tr>
                        <th style={styles.studentTh}>SUBJECT</th>
                        {isEndOfTerm && <th style={styles.studentTh}>MT (40)</th>}
                        {isEndOfTerm && <th style={styles.studentTh}>EOT (60)</th>}
                        <th style={styles.studentTh}>TOTAL</th>
                        <th style={styles.studentTh}>OUT OF</th>
                        <th style={styles.studentTh}>GRADE</th>
                        <th style={styles.studentTh}>COMMENT</th>
                        <th style={styles.studentTh}>INITIALS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedResults.map((r: any, i: number) => {
                        let midTermMarks = 0;
                        let endTermMarks = 0;
                        let totalMarks = 0;
                        
                        if (isEndOfTerm) {
                          midTermMarks = r.midTermScore ? Math.floor((r.midTermScore / 100) * 40) : 0;
                          endTermMarks = r.endTermScore ? Math.floor((r.endTermScore / 100) * 60) : 0;
                          totalMarks = midTermMarks + endTermMarks;
                        } else {
                          totalMarks = r.regularScore || r.midTermScore || r.endTermScore || 0;
                        }
                        
                        return (
                          <tr key={i}>
                            <td style={styles.studentTd}>{r.subject_name}</td>
                            {isEndOfTerm && <td style={styles.studentTd}>{midTermMarks}</td>}
                            {isEndOfTerm && <td style={styles.studentTd}>{endTermMarks}</td>}
                            <td style={styles.studentTd}>{Math.round(totalMarks)}</td>
                            <td style={styles.studentTd}>100</td>
                            <td style={{ ...styles.studentTd, color: 'red', fontWeight: 'bold' }}>{getGrade(totalMarks)}</td>
                            <td style={styles.studentTd}>{commentsForGrade(getGrade(totalMarks))}</td>
                            <td style={styles.studentTd}>{r.teacher_name ? r.teacher_name.split(' ').map((n: string) => n[0]).join('') : 'N/A'}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ fontWeight: 'bold' }}>
                        <td colSpan={isEndOfTerm ? 3 : 1} style={styles.studentTd}>TOTAL MARKS:</td>
                        <td style={styles.studentTd}>{Math.round(totalMarks)}</td>
                        <td style={styles.studentTd}>{groupedResults.length * 100}</td>
                        <td colSpan={3} style={styles.studentTd}>AVERAGE: {averageMarks}</td>
                      </tr>
                    </tbody>
                  </table>
                  {/* Assessment Section */}
                  <div style={{ marginTop: 20, fontSize: 14 }}>
                    <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 10 }}>General Assessment</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', border: '1px solid #000', borderRadius: 8 }}>
                      <div>
                        <p><strong>Aggregates:</strong> {aggregates}</p>
                        <p><strong>Division:</strong> {division}</p>
                      </div>
                      <div>
                        <p><strong>Position:</strong> {student.position} out of {student.totalInClass}</p>
                      </div>
                    </div>
                  </div>
                  {/* Comments Section */}
                  <div style={styles.comments}>
                    <CommentsSection student={student} />
                  </div>
                  {/* Grade Table */}
                  <GradeTable />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {showCustomization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-2xl" onClick={() => setShowCustomization(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Customize Report Style</h2>
            <div className="mb-4 flex gap-2 border-b">
              <button className={`px-3 py-1 ${customTab==='school'?'border-b-2 border-blue-600 font-semibold':''}`} onClick={()=>setCustomTab('school')}>School</button>
              <button className={`px-3 py-1 ${customTab==='banner'?'border-b-2 border-blue-600 font-semibold':''}`} onClick={()=>setCustomTab('banner')}>Banners</button>
              <button className={`px-3 py-1 ${customTab==='table'?'border-b-2 border-blue-600 font-semibold':''}`} onClick={()=>setCustomTab('table')}>Tables</button>
              <button className={`px-3 py-1 ${customTab==='comment'?'border-b-2 border-blue-600 font-semibold':''}`} onClick={()=>setCustomTab('comment')}>Comments</button>
              <button className={`px-3 py-1 ${customTab==='other'?'border-b-2 border-blue-600 font-semibold':''}`} onClick={()=>setCustomTab('other')}>Other</button>
              <button className={`px-3 py-1 ${customTab==='badge'?'border-b-2 border-blue-600 font-semibold':''}`} onClick={()=>setCustomTab('badge')}>Badge</button>
              <button className={`px-3 py-1 ${customTab==='result-comments'?'border-b-2 border-blue-600 font-semibold':''}`} onClick={()=>setCustomTab('result-comments')}>Result Comments</button>
            </div>
            <form>
              {customTab==='school' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold mb-1">School Name</label>
                    <input type="text" className="w-full border rounded px-2 py-1" name="school_name" placeholder="School Name" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">School Badge/Logo</label>
                    <input type="file" className="w-full border rounded px-2 py-1" name="school_logo_file" accept="image/*" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">School Motto</label>
                    <input type="text" className="w-full border rounded px-2 py-1" name="school_motto" placeholder="School Motto" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">School Contact</label>
                    <input type="text" className="w-full border rounded px-2 py-1" name="school_contact" placeholder="School Contact" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">School Address</label>
                    <input type="text" className="w-full border rounded px-2 py-1" name="school_address" placeholder="School Address" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">School Registration Number</label>
                    <input type="text" className="w-full border rounded px-2 py-1" name="school_registration_number" placeholder="PPS/N/297" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">UNEB Center Number</label>
                    <input type="text" className="w-full border rounded px-2 py-1" name="uneb_center_number" placeholder="080484" />
                  </div>
                </div>
              )}
              {customTab==='banner' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold mb-1">Banner1 BG</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="banner1_bgcolor" defaultValue="#0532ad" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Banner1 Text Color</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="banner1_textcolor" defaultValue="#ffffff" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Banner2 BG</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="banner2_bgcolor" defaultValue="#91908c" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Banner2 Text Color</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="banner2_textcolor" defaultValue="#000000" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Banner3 BG</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="banner3_bgcolor" defaultValue="#91908c" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Banner3 Text Color</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="banner3_textcolor" defaultValue="#000000" />
                  </div>
                </div>
              )}
              {customTab==='table' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold mb-1">Table Header BG</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="table_header_bg" defaultValue="#f0f8ff" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Table Border Color</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="table_border_color" defaultValue="#000000" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Table Font Size</label>
                    <input type="number" className="w-full border rounded px-2 py-1" name="table_font_size" min="8" max="20" defaultValue={14} />
                  </div>
                </div>
              )}
              {customTab==='comment' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Class Teacher's Comments for all divisions */}
                  <div>
                    <label className="block font-semibold mb-1">Class Teacher&apos;s Comment (Division 1)</label>
                    <select className="w-full border rounded px-2 py-1" name="class_teacher_comment_div1">
                      <option>Brilliant!! all my hopes are in you.</option>
                      <option>Outstanding Results, keep focused.</option>
                      <option>Excellent Results, keep focused.</option>
                      <option>Very good performance, keep up.</option>
                      <option>Encouraging results, keep up</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Class Teacher&apos;s Comment (Division 2)</label>
                    <select className="w-full border rounded px-2 py-1" name="class_teacher_comment_div2">
                      <option>Promising results, keep more focused.</option>
                      <option>work harder for a first grade.</option>
                      <option>I believe you can perform better than this.</option>
                      <option>I expect a first grade out of you.</option>
                      <option>I believe you can do better than this.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Class Teacher&apos;s Comment (Division 3)</label>
                    <select className="w-full border rounded px-2 py-1" name="class_teacher_comment_div3">
                      <option>Improve and make it to the next grade.</option>
                      <option>Create more time for revision.</option>
                      <option>Make very good use of the discussion groups.</option>
                      <option>Consult your teachers more often.</option>
                      <option>Improve and make it to the higher level</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Class Teacher&apos;s Comment (Division 4)</label>
                    <select className="w-full border rounded px-2 py-1" name="class_teacher_comment_div4">
                      <option>You have to be very active in the discussion groups.</option>
                      <option>concentrate more on your books.</option>
                      <option>Consult the teachers more often.</option>
                      <option>More effort is needed please.</option>
                      <option>Work harder please!!</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Class Teacher&apos;s Comment (Division U)</label>
                    <select className="w-full border rounded px-2 py-1" name="class_teacher_comment_divU">
                      <option>More concentration is needed from you in order to perform better.</option>
                      <option>Learn to always consult your friends and teachers.</option>
                      <option>Make proper use of the discussion groups please.</option>
                      <option>You have to create more time for academic work please.</option>
                      <option>Work very hard please, you can make it to the next grade.</option>
                    </select>
                  </div>
                  {/* Headteacher's Comments for all divisions */}
                  <div>
                    <label className="block font-semibold mb-1">Headteacher&apos;s Comment (Division 1)</label>
                    <select className="w-full border rounded px-2 py-1" name="headteacher_comment_div1">
                      <option>Great work done, keep it up.</option>
                      <option>All our hopes are in you, don&apos;t relax.</option>
                      <option>Job well done, keep it up.</option>
                      <option>Excellent performance, keep it up.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Headteacher&apos;s Comment (Division 2)</label>
                    <select className="w-full border rounded px-2 py-1" name="headteacher_comment_div2">
                      <option>You are a firstgrade material, keep more focused.</option>
                      <option>Quite remarkable performance, keep more focused.</option>
                      <option>Pretty good results, keep more focused.</option>
                      <option>Quite good results, keep more focused.</option>
                      <option>Quite encouraging. keep more focused</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Headteacher&apos;s Comment (Division 3)</label>
                    <select className="w-full border rounded px-2 py-1" name="headteacher_comment_div3">
                      <option>You need to be active in discussions.</option>
                      <option>You are capable of doing better than doing this.</option>
                      <option>More effort is needed from You.</option>
                      <option>You area capable of doing better than this.</option>
                      <option>Work harder for better grade.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Headteacher&apos;s Comment (Division 4)</label>
                    <select className="w-full border rounded px-2 py-1" name="headteacher_comment_div4">
                      <option>You are capable of Improving, just keep focused.</option>
                      <option>Create more time for academic work.</option>
                      <option>There is still room for improvement, never give up.</option>
                      <option>Cultivate a positive attitude towards the teachers.</option>
                      <option>Develop a positive attitude towards learning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Headteacher&apos;s Comment (Division U)</label>
                    <select className="w-full border rounded px-2 py-1" name="headteacher_comment_divU">
                      <option>concentrate more on academics for a better performance.</option>
                      <option>Cultivate a positive attitude towards academics.</option>
                      <option>Don&apos;t lose hope,there is still room for improvement.</option>
                      <option>Don&apos;t relax, you can still make it to the next level</option>
                    </select>
                  </div>
                </div>
              )}
              {customTab==='other' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold mb-1">Student Label Color</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="student_label_color" defaultValue="#000000" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Student Value Color</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="student_value_color" defaultValue="#ff0000" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Show Barcode</label>
                    <select className="w-full border rounded px-2 py-1" name="show_barcode">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Barcode Width</label>
                    <input type="number" className="w-full border rounded px-2 py-1" name="barcode_width" min="30" max="200" defaultValue={90} />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Barcode Height</label>
                    <input type="number" className="w-full border rounded px-2 py-1" name="barcode_height" min="10" max="100" defaultValue={30} />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Page Font Family</label>
                    <select className="w-full border rounded px-2 py-1" name="page_font_family">
                      <option value="'Segoe UI', sans-serif">Segoe UI</option>
                      <option value="'Arial', sans-serif">Arial</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Page Font Size</label>
                    <input type="number" className="w-full border rounded px-2 py-1" name="page_font_size" min="8" max="30" defaultValue={14} />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Page Background Color</label>
                    <input type="color" className="w-full border rounded px-2 py-1" name="page_background_color" defaultValue="#ffffff" />
                  </div>
                </div>
              )}
              {customTab==='badge' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold mb-1">Badge Size</label>
                    <select className="w-full border rounded px-2 py-1" name="badge_size">
                      <option value="small">Small (50px)</option>
                      <option value="medium">Medium (150px)</option>
                      <option value="large">Large (300px)</option>
                    </select>
                  </div>
                </div>
              )}
              {customTab==='result-comments' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold mb-1">Comment for Grade D1</label>
                    <select className="w-full border rounded px-2 py-1" name="result_comment_d1">
                      <option>Excellent results, keep it up.</option>
                      <option>Very encouraging results, Donot relax.</option>
                      <option>Great work done, keep engaging.</option>
                      <option>Well done good learner, keep focused.</option>
                      <option>Excellent, all hopes are in you.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Comment for Grade D2</label>
                    <select className="w-full border rounded px-2 py-1" name="result_comment_d2">
                      <option>Very good score, but aim at excellency.</option>
                      <option>This is encouraging, though you should push for D1.</option>
                      <option>Very good results, though you can do better than this.</option>
                      <option>Thank you for the good work done, however, keep more focused.</option>
                      <option>Encouraging results, but you can improve on them next time.</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded" type="button" onClick={() => setShowCustomization(false)}>Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;