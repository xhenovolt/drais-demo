"use client";
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { t } from '@/lib/i18n';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const API_BASE = '/api';
const fetcher = (u: string) => fetch(u).then(r => r.json());
export const SubjectsManager: React.FC = () => {
  const { data, mutate } = useSWR(`${API_BASE}/subjects`, fetcher);
  const rows=data?.data||[]; const [form,setForm] = useState({ name:'', code:'', subject_type:'core' });
  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [search,setSearch]=useState(''); const [page,setPage]=useState(1); const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', subject_type: '' });
  const perPage=10;
  const add = async () => {
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Subject added successfully');
        setFormData({ name: '', code: '', subject_type: 'core' });
        setIsModalOpen(false);
        setItems((prevItems) => [...prevItems, { id: result.id, ...formData }]);
        mutate();
      } else {
        toast.error(result.error || 'Failed to add subject');
      }
    } catch (error) {
      toast.error('An error occurred while adding the subject');
    }
  };
  const editSubject = async (id: number) => {
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...formData }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Subject updated successfully');
        setFormData({ name: '', code: '', subject_type: 'core' });
        setIsModalOpen(false);
        setItems((prevItems) => prevItems.map((item) => (item.id === id ? { id, ...formData } : item)));
        mutate();
      } else {
        toast.error(result.error || 'Failed to update subject');
      }
    } catch (error) {
      toast.error('An error occurred while updating the subject');
    }
  };
  const deleteSubject = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`${API_BASE}/subjects?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Subject deleted successfully');
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        mutate();
      } else {
        toast.error(result.error || 'Failed to delete subject');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the subject');
    }
  };
  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/subjects`).then(r => r.json()).then(d => {
      setItems(d.data || []);
      setTotal(d.total || 0);
    }).catch(e => setMessage(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [page, search]);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    add();
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">Subjects</h1>
        <div className="relative flex-1 max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search subjects..."
            className="w-full px-3 py-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 disabled:opacity-40 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          {loading ? 'Loading' : 'Reload'}
        </button>
        <button onClick={openModal} className="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">Add Subject</button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/30 dark:border-white/10 shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.code || '-'}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.subject_type || '-'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => {
                      setFormData(item);
                      setIsModalOpen(true);
                    }}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteSubject(item.id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  No subjects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-sm pt-4">
        <span className="text-gray-600 dark:text-gray-400">Page {page} of {Math.ceil(total / perPage)}</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= Math.ceil(total / perPage)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <Transition appear show={isModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4">
              <Dialog.Panel className="w-full max-w-lg p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white rounded-2xl shadow-2xl backdrop-blur-md">
                <Dialog.Title className="text-xl font-bold text-center mb-4">Add Subject</Dialog.Title>
                <button onClick={closeModal} className="absolute top-4 right-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                  <X className="w-5 h-5 text-white" />
                </button>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium">Subject Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="code" className="block text-sm font-medium">Code</label>
                    <input
                      id="code"
                      name="code"
                      type="text"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject_type" className="block text-sm font-medium">Subject Type</label>
                    <input
                      id="subject_type"
                      name="subject_type"
                      type="text"
                      value={formData.subject_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105">Save</button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

interface Subject {
  id: number;
  name: string;
  code?: string;
  subject_type?: string;
}

export default SubjectsManager;