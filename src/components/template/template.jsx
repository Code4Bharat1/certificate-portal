'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Upload, Trash2, Edit, Eye, X, Download, File, Image as ImageIcon, AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';

export default function TemplateManagement() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [authError, setAuthError] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Get headers with optional token
  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setAuthError(false);
      
      console.log('🔄 Fetching templates from:', `${API_URL}/api/templates`);
      
      const response = await axios.get(`${API_URL}/api/templates`, {
        headers: getHeaders()
      });
      
      console.log('✅ Templates fetched:', response.data);
      
      if (response.data.success) {
        setTemplates(response.data.data || []);
        if (response.data.data?.length === 0) {
          showMessage('info', 'No templates found. Upload your first template!');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        setAuthError(true);
        showMessage('error', 'Authentication required. Please login first.');
      } else if (error.code === 'ERR_NETWORK') {
        showMessage('error', 'Cannot connect to server. Is the backend running?');
      } else if (error.response?.status === 404) {
        showMessage('error', 'API endpoint not found. Check your backend routes.');
      } else {
        showMessage('error', error.response?.data?.message || 'Failed to fetch templates');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reload templates from backend folder
  const reloadTemplates = async () => {
    try {
      setReloading(true);
      console.log('🔄 Reloading templates from backend folder...');
      
      const response = await axios.get(`${API_URL}/api/templates/reload/all`, {
        headers: getHeaders()
      });
      
      console.log('✅ Templates reloaded:', response.data);
      
      if (response.data.success) {
        setTemplates(response.data.data || []);
        showMessage('success', `Reloaded ${response.data.count} templates from backend folder!`);
      }
    } catch (error) {
      console.error('❌ Error reloading templates:', error);
      showMessage('error', 'Failed to reload templates from backend folder');
    } finally {
      setReloading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  // Upload template
  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage('error', 'Please select a file first');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('template', selectedFile);
      formData.append('name', selectedFile.name);
      formData.append('description', editData.description || '');

      console.log('📤 Uploading file:', selectedFile.name);

      const response = await axios.post(`${API_URL}/api/templates/upload`, formData, {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      console.log('✅ Upload successful:', response.data);

      if (response.data.success) {
        showMessage('success', 'Template uploaded successfully!');
        setSelectedFile(null);
        setPreviewUrl(null);
        setEditData({ name: '', description: '' });
        setUploadProgress(0);
        fetchTemplates();
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        showMessage('error', 'Authentication required. Please login first.');
      } else {
        showMessage('error', error.response?.data?.message || 'Failed to upload template');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const handleDelete = async (id) => {
    try {
      console.log('🗑️ Deleting template:', id);
      
      const response = await axios.delete(`${API_URL}/api/templates/${id}`, {
        headers: getHeaders()
      });

      console.log('✅ Delete successful:', response.data);

      if (response.data.success) {
        showMessage('success', 'Template deleted successfully!');
        fetchTemplates();
        setShowModal(false);
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      showMessage('error', error.response?.data?.message || 'Failed to delete template');
    }
  };

  // Update template
  const handleUpdate = async () => {
    try {
      console.log('✏️ Updating template:', selectedTemplate.id);
      
      const response = await axios.put(
        `${API_URL}/api/templates/${selectedTemplate.id}`,
        {
          name: editData.name,
          description: editData.description
        },
        {
          headers: getHeaders()
        }
      );

      console.log('✅ Update successful:', response.data);

      if (response.data.success) {
        showMessage('success', 'Template updated successfully!');
        fetchTemplates();
        setShowModal(false);
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      showMessage('error', error.response?.data?.message || 'Failed to update template');
    }
  };

  // Download template
  const handleDownload = async (template) => {
    try {
      console.log('💾 Downloading template:', template.name);
      
      const response = await axios.get(
        `${API_URL}/api/templates/${template.id}/download`,
        {
          headers: getHeaders(),
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', template.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showMessage('success', 'Template downloaded successfully!');
    } catch (error) {
      console.error('❌ Download error:', error);
      showMessage('error', error.response?.data?.message || 'Failed to download template');
    }
  };

  // Show message
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Open modal
  const openModal = (mode, template = null) => {
    setModalMode(mode);
    setSelectedTemplate(template);
    if (mode === 'edit' && template) {
      setEditData({ name: template.name, description: template.description || '' });
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back to Dashboard Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02, x: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all border-2 border-gray-200 hover:border-blue-400"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </motion.button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Template Management
              </h1>
              <p className="text-gray-600">Upload, manage, and organize your certificate templates</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Dashboard Button (Alternative Style) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Home size={20} />
                <span className="hidden sm:inline">Dashboard</span>
              </motion.button>

              {/* Reload Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reloadTemplates}
                disabled={reloading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                <RefreshCw size={20} className={reloading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{reloading ? 'Reloading...' : 'Reload'}</span>
              </motion.button>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${authError ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
              <span className="text-sm text-gray-600">
                {authError ? 'Authentication Required' : 'Connected to API'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {templates.length} template{templates.length !== 1 ? 's' : ''} loaded
            </div>
          </div>
        </motion.div>

        {/* Message Alert */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl shadow-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-2 border-green-500 text-green-700' 
                  : message.type === 'info'
                  ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                  : 'bg-red-50 border-2 border-red-500 text-red-700'
              }`}
            >
              <span className="text-xl">
                {message.type === 'success' ? '✅' : message.type === 'info' ? 'ℹ️' : '❌'}
              </span>
              <span className="font-semibold flex-1">{message.text}</span>
              <button 
                onClick={() => setMessage({ type: '', text: '' })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-blue-50 border-2 border-blue-400 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 Pro Tip:</p>
            <p>If you manually added files to the <code className="bg-blue-100 px-2 py-0.5 rounded">templates</code> folder, click the <strong>"Reload"</strong> button above to sync them!</p>
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Upload className="text-blue-600" size={28} />
            Upload New Template
          </h2>

          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-all duration-300 bg-gray-50">
              <input
                type="file"
                id="fileInput"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg shadow-lg" />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <File className="text-white" size={40} />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      {selectedFile ? selectedFile.name : 'Click to upload template'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports: Images (Max 50MB)
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Enter template description..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all ${
                !selectedFile || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-2xl'
              }`}
            >
              {loading ? 'Uploading...' : 'Upload Template'}
            </motion.button>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ImageIcon className="text-purple-600" size={28} />
            All Templates ({templates.length})
          </h2>

          {loading && !templates.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-80"></div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Templates Yet</h3>
              <p className="text-gray-500 mb-4">Upload your first template to get started!</p>
              <p className="text-sm text-gray-400">Or if you have files in the templates folder, click "Reload" above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id || template._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group"
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
                    <div className={template.thumbnail ? 'hidden' : 'flex'} style={{ display: template.thumbnail ? 'none' : 'flex' }}>
                      <File className="text-gray-400" size={64} />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => openModal('view', template)}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 truncate" title={template.name}>
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {template.description || 'No description available'}
                    </p>
                    
                    <div className="text-xs text-gray-400 mb-4">
                      Uploaded: {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openModal('view', template)}
                        className="bg-blue-100 text-blue-600 p-3 rounded-lg hover:bg-blue-200 transition-all"
                        title="View"
                      >
                        <Eye size={18} className="mx-auto" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownload(template)}
                        className="bg-green-100 text-green-600 p-3 rounded-lg hover:bg-green-200 transition-all"
                        title="Download"
                      >
                        <Download size={18} className="mx-auto" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openModal('edit', template)}
                        className="bg-yellow-100 text-yellow-600 p-3 rounded-lg hover:bg-yellow-200 transition-all"
                        title="Edit"
                      >
                        <Edit size={18} className="mx-auto" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openModal('delete', template)}
                        className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} className="mx-auto" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal - Same as before */}
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
                      <label className="font-semibold text-gray-700">Description:</label>
                      <p className="text-gray-600">{selectedTemplate.description || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700">Uploaded:</label>
                      <p className="text-gray-600">
                        {selectedTemplate.createdAt ? new Date(selectedTemplate.createdAt).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                {modalMode === 'edit' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Name:</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Description:</label>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
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
                        Are you sure you want to delete <strong>{selectedTemplate.name}</strong>?
                      </p>
                      <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className="py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(selectedTemplate.id || selectedTemplate._id)}
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