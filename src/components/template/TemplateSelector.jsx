// Component to select from available templates
// Can be added to both CreateCertificate.jsx and CreateLetter.jsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { File, Image, AlertCircle, Loader2 } from 'lucide-react';

export default function TemplateSelector({ onSelect, selectedTemplateId = null }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
        headers: getHeaders()
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
          <p className="text-yellow-700">No templates available. Please upload templates first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {templates.map((template) => (
            <motion.div
              key={template.id || template._id}
              whileHover={{ y: -5, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(template)}
              className={`
                cursor-pointer rounded-xl overflow-hidden border-2 
                ${selectedTemplateId === template.id ? 
                  'border-blue-500 ring-2 ring-blue-300' : 
                  'border-gray-200 hover:border-blue-300'
                }
                transition-all duration-200
              `}
            >
              <div className="h-28 bg-gray-100 flex items-center justify-center relative">
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
                ) : (
                  <File className="text-gray-400" size={36} />
                )}
                
                {selectedTemplateId === template.id && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-2 bg-white">
                <p className="text-xs font-medium text-gray-700 truncate" title={template.name}>
                  {template.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

