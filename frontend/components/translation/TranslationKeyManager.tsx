'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useUIStore } from '@/store/uiStore';
import { Pencil, Trash2, Save } from 'lucide-react';
import LoadingSpinner from '../layouts/LoadingSpinner';


const PAGE_SIZE = 10;
const htmlElementOptions = ['button', 'heading', 'label', 'input', 'link', 'paragraph'];

const TranslationKeyManager = () => {
  const selectedProject = useUIStore((s) => s.selectedProject);
  const selectedLanguage = useUIStore((s) => s.selectedLanguage);
  const username = useUIStore((state) => state.userEmail);
  const data = useUIStore((s) => s.translationData);
  const setData = useUIStore((s) => s.setTranslationData);
  // get token
  const token = useUIStore((s) => s.token);
  const setToken = useUIStore((s) => s.setToken);

  // bulk update
  const availableLanguages = useUIStore((s) => s.availableLanguages);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLang, setBulkLang] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);


  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<{ value: string; description: string }>({
    value: '',
    description: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    key: '',
    value: '',
    category: '',
    description: ''
  });

  // Show Spinner
  const [loading, setLoading] = useState(false);

  const query = useQuery({
    queryKey: ['translations', selectedProject, selectedLanguage],
    queryFn: async () => {
      setLoading(true);
      const res = await fetch(
        `http://127.0.0.1:8000/localizations/${selectedProject}/${selectedLanguage}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLoading(false);
      
      if (res.status === 401) {        
        setToken(null);
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to fetch translations');
      return res.json();
    },
    enabled: !!selectedProject && !!selectedLanguage,
  });

  useEffect(() => {
    if (query.data && JSON.stringify(data) !== JSON.stringify(query.data)) {
      setData(query.data);
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: async ({ key, value, description }: any) => {
      setLoading(true);
      const res = await fetch(
        `http://127.0.0.1:8000/localizations/${selectedProject}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key, value, description, language: selectedLanguage, updated_by: username }),
        }
      );
      setLoading(false);
      if (res.status === 401) {
        setToken(null);
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to update translation');
      return res.json();
    },
  });

  // Fix infinite API call for get localization API.
  useEffect(() => {
    if (mutation.isSuccess) {
      query.refetch();
      mutation.reset();
    }
  }, [mutation.isSuccess]);


  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/localizations/${selectedProject}/${key}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLoading(true);
      if (res.status === 401) {
        setToken(null);
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to delete key');
      return res.json();
    },
    onSuccess: () => query.refetch()
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/localizations/${selectedProject}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...newKeyData,
          language: selectedLanguage,
          updated_by: username,
        })
      });
      setLoading(true);
      if (res.status === 401) {
        setToken(null);
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to add key');
      return res.json();
    },
    onSuccess: () => {
      query.refetch();
      setShowModal(false);
      setNewKeyData({ key: '', value: '', category: '', description: '' });
    }
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async () => {
      if (!csvFile || !bulkLang) throw new Error("Missing CSV file or language");
      setLoading(true);

      const formData = new FormData();
      formData.append('file', csvFile);

      const res = await fetch(
        `http://127.0.0.1:8000/localizations/upload/${selectedProject}/${bulkLang}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData,
        }
      );
      setLoading(false);
      if (res.status === 401) {
        setToken(null);
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Bulk upload failed');
      return res.json();
    },
    onSuccess: () => {
      query.refetch();
      setShowBulkModal(false);
      setCsvFile(null);
      setBulkLang('');
    }
  });


  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredData = data.filter((row: any) => {
    const matchesSearch = row.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row?.translations?.[selectedLanguage]?.value?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTags.length === 0 || selectedTags.includes(row.category);
    return matchesSearch && matchesTag;
  });

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedData = filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const startEditing = (row: any) => {
    setEditingRow(row.id);
    setFormValues({ value: row?.translations?.[selectedLanguage]?.value, description: row.description });
  };

  const handleSave = async (row: any) => {
    mutation.mutate({
      key: row.key,
      value: formValues.value,
      description: formValues.description,
    });
    setEditingRow(null);
  };

  return (
    <>
      <div>
        {loading && <LoadingSpinner />}
      </div>
      <div className="space-y-6">
        {/* Toolbar Section */}
        <div className="bg-white text-black p-4 rounded shadow flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <input
              type="text"
              placeholder="Search translation keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0046db]"
            />

            {/* Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((prev) => !prev)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded bg-white hover:bg-gray-100"
              >
                Filter: {selectedTags.length > 0 ? selectedTags.join(', ') : 'All'}
              </button>
              {filterOpen && (
                <div className="absolute z-10 mt-1 bg-white text-black rounded shadow w-48 max-h-48 overflow-y-auto border border-gray-200">
                  {htmlElementOptions.map((tag) => (
                    <label key={tag} className="block px-3 py-2 hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#0046db] text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Add Key
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-[#0046db] text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              ⬆ Bulk Add
            </button>
          </div>
        </div>


        {/* Table Section */}
        <div className="bg-white text-black rounded shadow p-4 space-y-4">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-[#0046db] text-white text-left">
                <th className="px-4 py-2">Edit</th>
                <th className="px-4 py-2">Key</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row: any) => (
                <tr key={row.id || row.key} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {editingRow === row.id ? (
                      <button onClick={() => handleSave(row)} className="text-green-600 hover:text-green-800">
                        <Save size={16} />
                      </button>
                    ) : (
                      <button onClick={() => startEditing(row)} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={16} />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-[#0046db]">{row.key}</td>
                  <td className="px-4 py-2">
                    {editingRow === row.id ? (
                      <input
                        value={formValues.value}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, value: e.target.value }))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : (
                      row?.translations?.[selectedLanguage]?.value
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingRow === row.id ? (
                      <input
                        value={formValues.description}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : (
                      row.description
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => deleteMutation.mutate(row.key)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-lg font-bold mb-4 text-[#0046db]">Add New Translation Key</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addMutation.mutate();
                }}
              >
                <input
                  type="text"
                  placeholder="Enter a unique key*"
                  value={newKeyData.key}
                  onChange={(e) => setNewKeyData((prev) => ({ ...prev, key: e.target.value }))}
                  className="w-full px-3 py-2 mb-4 border rounded text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Enter value to show*"
                  value={newKeyData.value}
                  onChange={(e) => setNewKeyData((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 mb-4 border rounded text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newKeyData.description}
                  onChange={(e) => setNewKeyData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 mb-4 border rounded text-black"
                />
                <select
                  value={newKeyData.category}
                  onChange={(e) => setNewKeyData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 mb-4 border rounded text-black"
                  required
                >
                  <option value="">Select category*</option>
                  {htmlElementOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-black rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0046db] text-white font-semibold rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-lg font-bold mb-4 text-[#0046db]">Bulk Upload CSV</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  bulkUploadMutation.mutate();
                }}
              >
                <select
                  value={bulkLang}
                  onChange={(e) => setBulkLang(e.target.value)}
                  className="w-full px-3 py-2 mb-4 border rounded text-black"
                  required
                >
                  <option value="">Select Language</option>
                  {availableLanguages.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.value || lang.id}</option>
                  ))}
                </select>

                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 mb-4 border rounded text-black"
                  required
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 bg-gray-200 text-black rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0046db] text-white font-semibold rounded"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


      </div>
    </>
  );
};

export default TranslationKeyManager;
