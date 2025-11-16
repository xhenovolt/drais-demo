"use client";
import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, User, Users, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import AddContactModal from '@/components/students/AddContactModal';

const ContactsPage: React.FC = () => {
  const [schoolId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch contacts data
  const { data: contactsData, isLoading, mutate } = useSWR(
    `/api/students/contacts?school_id=${schoolId}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const contacts = contactsData?.data || [];

  // Filter contacts based on search
  const filteredContacts = contacts.filter((contact: any) => {
    const studentName = `${contact.student_first_name} ${contact.student_last_name}`.toLowerCase();
    const contactName = `${contact.contact_first_name} ${contact.contact_last_name}`.toLowerCase();
    const searchTerm = searchQuery.toLowerCase();
    
    return !searchQuery || 
      studentName.includes(searchTerm) ||
      contactName.includes(searchTerm) ||
      contact.relationship?.toLowerCase().includes(searchTerm);
  });

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship?.toLowerCase()) {
      case 'parent':
      case 'father':
      case 'mother':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'guardian':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📞 Student Contacts
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredContacts.length} contact records
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Contact
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students, contacts, or relationships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading contacts...</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredContacts.map((contact: any, index: number) => (
                <motion.div
                  key={`${contact.student_id}-${contact.contact_id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {contact.student_first_name?.charAt(0)}{contact.student_last_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {contact.student_first_name} {contact.student_last_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contact.class_name || 'Not Assigned'} • {contact.admission_no}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {contact.contact_first_name} {contact.contact_last_name}
                          </h4>
                          {contact.is_primary && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          {getRelationshipIcon(contact.relationship)}
                          <span>{contact.relationship}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-2">
                      {contact.contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span>{contact.contact_phone}</span>
                        </div>
                      )}
                      {contact.contact_email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span>{contact.contact_email}</span>
                        </div>
                      )}
                      {contact.occupation && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Occupation:</span> {contact.occupation}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {filteredContacts.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12">
              <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No contacts found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          mutate();
        }}
      />
    </div>
  );
};

export default ContactsPage;
