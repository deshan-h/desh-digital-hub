import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Search, Plus, Trash2, User, Phone, MapPin, HelpCircle } from 'lucide-react';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

export default function CustomerDirectory({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Modal State
  const [deleteRecordId, setDeleteRecordId] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const q = query(collection(db, 'customers'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
      notify.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      notify.error("Customer Name is required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'customers'), {
        name: name.trim(),
        phone: phone.trim(),
        area: area.trim(),
        timestamp: serverTimestamp()
      });
      notify.success("Customer added successfully!");
      setName('');
      setPhone('');
      setArea('');
      fetchRecords();
    } catch (error) {
      console.error("Error adding customer:", error);
      notify.error("Failed to add customer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;
    setDeleteRecordId(id);
  };

  const confirmDelete = async () => {
    if (!deleteRecordId) return;
    try {
      await deleteDoc(doc(db, 'customers', deleteRecordId));
      notify.success("Customer deleted");
      fetchRecords();
    } catch (error) {
      console.error("Error deleting customer:", error);
      notify.error("Failed to delete customer.");
    } finally {
      setDeleteRecordId(null);
    }
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (record.name?.toLowerCase().includes(searchLower)) ||
      (record.phone?.toLowerCase().includes(searchLower)) ||
      (record.area?.toLowerCase().includes(searchLower))
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[1600px] mx-auto pb-32">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-emerald-400" />
            Customer Directory
          </h1>
          <div className="relative group cursor-help mt-1">
            <HelpCircle className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-max max-w-xs px-3 py-2 bg-slate-800/95 backdrop-blur text-slate-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl border border-slate-700 z-50">
              Manage your shop's customers and their contact info.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
            <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Add Customer
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    placeholder="e.g. Nimal Perera"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    placeholder="e.g. 071 234 5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Area / Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    placeholder="e.g. Colombo 07"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Customer'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-full min-h-[500px]">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search customers by name, phone or area..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-950/50 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-3">Customer Name</div>
                  <div className="col-span-2">Phone</div>
                  <div className="col-span-3">Area</div>
                  <div className="col-span-3">Most Visited</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-800/50">
                  {paginatedRecords.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">No customers found.</div>
                  ) : (
                    paginatedRecords.map((record) => (
                      <div key={record.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/20 transition-colors">
                        
                        {/* Name */}
                        <div className="col-span-3">
                          <div className="font-bold text-slate-200 text-sm">{record.name}</div>
                        </div>

                        {/* Phone */}
                        <div className="col-span-2 text-slate-300 text-sm">
                          {record.phone || '-'}
                        </div>

                        {/* Area */}
                        <div className="col-span-3 text-slate-300 text-sm">
                          {record.area || '-'}
                        </div>

                        {/* Most Visited */}
                        <div className="col-span-3 text-slate-300 text-sm">
                          {record.mostVisited || '-'}
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex justify-end">
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(record.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* PAGINATION CONTROLS */}
            {filteredRecords.length > 0 && (
              <div className="border-t border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-bold text-slate-400">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} of {filteredRecords.length} customers
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-200">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={!!deleteRecordId}
        onClose={() => setDeleteRecordId(null)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
      />
    </div>
  );
}
