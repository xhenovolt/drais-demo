"use client";
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_LIST = '/api/attendance/list';
const API_SIGNIN = '/api/attendance/signin';
const API_SIGNOUT = '/api/attendance/signout';

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  class_id: string;
  stream_id?: string;
  photo_url?: string;
  time_in?: string;
  time_out?: string;
  status: string;
}

export default function StudentAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [classId, setClassId] = useState('');
  const [streamId, setStreamId] = useState('');

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line
  }, [date, classId, streamId]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_LIST}?date=${date}&class_id=${classId}&stream_id=${streamId}`);
      const data = await res.json();
      setStudents(data.data || []);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (student_id: number, class_id: string) => {
    try {
      const res = await fetch(API_SIGNIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id, class_id, date }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Signed in successfully');
        loadStudents();
      } else {
        toast.error('Failed to sign in');
      }
    } catch (error) {
      toast.error('Failed to sign in');
    }
  };

  const handleSignOut = async (student_id: number, class_id: string) => {
    try {
      const res = await fetch(API_SIGNOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id, class_id, date }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Signed out successfully');
        loadStudents();
      } else {
        toast.error('Failed to sign out');
      }
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="p-4 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md shadow-md">
      <ToastContainer />
      <h2 className="text-xl font-bold text-gray-800">Student Attendance</h2>
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm"
        />
        <input
          type="text"
          placeholder="Class ID"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm"
        />
        <input
          type="text"
          placeholder="Stream ID"
          value={streamId}
          onChange={(e) => setStreamId(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm"
        />
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border rounded-md focus:ring-1 focus:ring-blue-400 text-sm"
        />
      </div>
      <div className="overflow-auto rounded-md shadow">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1">#</th>
              <th className="px-2 py-1">Photo</th>
              <th className="px-2 py-1">Name</th>
              <th className="px-2 py-1">Class</th>
              <th className="px-2 py-1">Stream</th>
              <th className="px-2 py-1">Time In</th>
              <th className="px-2 py-1">Time Out</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={student.student_id} className="hover:bg-gray-50">
                <td className="px-2 py-1">{index + 1}</td>
                <td className="px-2 py-1">
                  {student.photo_url ? (
                    <img src={student.photo_url} alt="photo" className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="w-8 h-8 inline-block bg-gray-200 rounded-full" />
                  )}
                </td>
                <td className="px-2 py-1">{student.first_name} {student.last_name}</td>
                <td className="px-2 py-1">{student.class_id}</td>
                <td className="px-2 py-1">{student.stream_id || '-'}</td>
                <td className="px-2 py-1">{student.time_in || '-'}</td>
                <td className="px-2 py-1">{student.time_out || '-'}</td>
                <td className="px-2 py-1">
                  {student.time_in && student.time_out ? (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded">Done</span>
                  ) : student.time_in ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded">Signed In</span>
                  ) : (
                    <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded">Not Signed In</span>
                  )}
                </td>
                <td className="px-2 py-1">
                  {!student.time_in ? (
                    <button
                      onClick={() => handleSignIn(student.student_id, student.class_id)}
                      className="px-2 py-1 bg-green-500 text-white rounded-md text-xs"
                    >
                      Sign In
                    </button>
                  ) : student.time_in && !student.time_out ? (
                    <button
                      onClick={() => handleSignOut(student.student_id, student.class_id)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded-md text-xs ml-1"
                    >
                      Sign Out
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="px-2 py-2 text-center text-gray-500 text-xs">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <div className="px-2 py-2 text-center text-sm">Loading...</div>}
      </div>
    </div>
  );
}