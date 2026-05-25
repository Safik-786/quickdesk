import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiXCircle, FiSettings, FiDatabase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { uploadKnowledgeDocument } from '../admin.api';

export default function KnowledgeBaseUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validExtensions = ['.pdf', '.txt', '.md', '.csv'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      setFile(selectedFile);
    } else {
      toast.error(`Unsupported file type: ${fileExtension}. Please upload PDF, TXT, MD, or CSV.`);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    try {
      await uploadKnowledgeDocument(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      toast.success('File uploaded successfully! Processing started in the background.');
      setFile(null);
      setProgress(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-gray-800 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Knowledge Base Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Upload and manage documents to train the AI assistant's embedding vectors.
        </p>
      </div>

      {/* Menubar / Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl mb-8 w-max shadow-inner">
        {[
          { id: 'upload', icon: FiUploadCloud, label: 'Upload Documents' },
          { id: 'chunks', icon: FiDatabase, label: 'Manage Vectors' },
          { id: 'settings', icon: FiSettings, label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl shadow-gray-200/40 dark:shadow-none"
          >
            <div className="flex flex-col items-center justify-center">
              <div
                className={`w-full max-w-3xl relative p-12 mt-4 border-2 border-dashed rounded-2xl transition-colors duration-200 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer
                  ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50/50 dark:bg-gray-800/50'}
                  ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.md,.csv"
                  onChange={handleChange}
                  disabled={uploading}
                />
                
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <FiUploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Click to upload or drag and drop
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: PDF, TXT, MD, CSV (Max size: 50MB)
                </p>
              </div>

              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="w-full max-w-3xl mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <FiFileText className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    {!uploading && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiXCircle className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {uploading && (
                <div className="w-full max-w-3xl mt-6">
                  <div className="flex justify-between text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    <span>Uploading & Vectorizing...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="w-full max-w-3xl mt-8 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                    !file || uploading
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      <span>Start Processing Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab !== 'upload' && (
          <motion.div
            key="other"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 text-center text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl"
          >
            <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <FiDatabase className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Coming Soon</h3>
            <p className="mt-1">This section is currently under construction.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
