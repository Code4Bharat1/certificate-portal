'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  File,
  Image,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Edit,
  Trash2,
  X
} from 'lucide-react';

export default function TemplateSelector({ onSelect, selectedTemplateId = null }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '' });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

  // Get headers with optional token
  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/templates`, {
        headers: getHeaders(),
      });

      if (response.data.success) {
        setTemplates(response.data.data || []);
      } else {
        setError('Failed to fetch templates');
      }
    } catch (error) {
      setError('Error loading templates');
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, template) => {
    setModalMode(mode);
    setSelectedTemplate(template);
    setShowModal(true);

    if (mode === 'edit' && template) {
      setEditData({
        name: template.name || '',
        description: template.description || '',
      });
    }
  };

  const handleDownload = async (template) => {
    try {
      const response = await axios.get(`${API_URL}/api/templates/${template.id || template._id}/download`, {
        headers: getHeaders(),
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${template.name || 'template'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download the template.');
    }
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;

    try {
      await axios.put(
        `${API_URL}/api/templates/${selectedTemplate.id || selectedTemplate._id}`,
        editData,
        { headers: getHeaders() }
      );

      setShowModal(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update the template.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/templates/${id}`, {
        headers: getHeaders(),
      });
      setShowModal(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Select Template</h3>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {templates.length === 0 && !loading ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
          <p className="text-yellow-700">
            No templates available. Please upload templates first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id || template._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden group border-2 ${
                selectedTemplateId === template.id ? 'border-blue-500' : 'border-transparent'
              }`}
              onClick={() => onSelect && onSelect(template)}
            >
              {/* Template Preview */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                {template.thumbnail ? (
                  <img
                    src={`${API_URL}${template.thumbnail}`}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                <div
                  className={template.thumbnail ? 'hidden' : 'flex'}
                  style={{ display: template.thumbnail ? 'none' : 'flex' }}
                >
                  <File className="text-gray-400" size={64} />
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('view', template);
                    }}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                  >
                    Quick View
                  </button>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3
                  className="font-bold text-lg text-gray-800 mb-2 truncate"
                  title={template.name}
                >
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {template.description || 'No description available'}
                </p>

                <div className="text-xs text-gray-400 mb-4">
                  Uploaded:{' '}
                  {template.createdAt
                    ? new Date(template.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </div>

                {/* Action Buttons */}
                {/* <div className="grid grid-cols-flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('view', template);
                    }}
                    className="bg-blue-100 text-blue-600 p-3 rounded-lg hover:bg-blue-200 transition-all"
                    title="View"
                  >
                    <Eye size={18} className="mx-auto" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(template);
                    }}
                    className="bg-green-100 text-green-600 p-3 rounded-lg hover:bg-green-200 transition-all"
                    title="Download"
                  >
                    <Download size={18} className="mx-auto" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('edit', template);
                    }}
                    className="bg-yellow-100 text-yellow-600 p-3 rounded-lg hover:bg-yellow-200 transition-all"
                    title="Edit"
                  >
                    <Edit size={18} className="mx-auto" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('delete', template);
                    }}
                    className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} className="mx-auto" />
                  </motion.button>
                </div> */}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-2xl font-bold text-gray-800">
                  {modalMode === 'view' && 'Template Details'}
                  {modalMode === 'edit' && 'Edit Template'}
                  {modalMode === 'delete' && 'Delete Template'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {modalMode === 'view' && selectedTemplate && (
                  <div className="space-y-4">
                    {selectedTemplate.thumbnail && (
                      <img
                        src={`${API_URL}${selectedTemplate.thumbnail}`}
                        alt={selectedTemplate.name}
                        className="w-full rounded-lg shadow-lg"
                      />
                    )}
                    <div>
                      <label className="font-semibold text-gray-700">Name:</label>
                      <p className="text-gray-600">{selectedTemplate.name}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700">
                        Description:
                      </label>
                      <p className="text-gray-600">
                        {selectedTemplate.description || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700">
                        Uploaded:
                      </label>
                      <p className="text-gray-600">
                        {selectedTemplate.createdAt
                          ? new Date(selectedTemplate.createdAt).toLocaleString()
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                {modalMode === 'edit' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">
                        Name:
                      </label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">
                        Description:
                      </label>
                      <textarea
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({ ...editData, description: e.target.value })
                        }
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleUpdate}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      Update Template
                    </button>
                  </div>
                )}

                {modalMode === 'delete' && selectedTemplate && (
                  <div className="space-y-4">
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                      <div className="text-6xl mb-4">⚠️</div>
                      <p className="text-lg text-gray-700">
                        Are you sure you want to delete{' '}
                        <strong>{selectedTemplate.name}</strong>?
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        This action cannot be undone.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className="py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(selectedTemplate.id || selectedTemplate._id)
                        }
                        className="py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
