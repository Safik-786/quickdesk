import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiXCircle, FiSettings, FiDatabase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { uploadKnowledgeDocument } from '../admin.api';
import PageHeader from '../../../components/ui/PageHeader';

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
    <div className="min-h-screen bg-white rounded-xl shadow overflow-hidden w-full max-w-full">
      <main className="max-w-7xl mx-auto px-4 sm:p-6 max-w-full overflow-hidden">
        
        <PageHeader 
          title="Knowledge Base Management" 
          description="Upload and manage documents to train the AI assistant's embedding vectors."
        />

        {/* Menubar / Tabs */}
        <div className="flex space-x-1 bg-blue-50 p-1 rounded-xl mb-8 w-max border border-gray-100">
          {[
            { id: 'upload', icon: FiUploadCloud, label: 'Upload Documents' },
            { id: 'chunks', icon: FiDatabase, label: 'Manage Vectors' },
            { id: 'settings', icon: FiSettings, label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center cursor-pointer space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900 cursor-pointer shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white'
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
              initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center">
                <div
                  className={`w-full max-w-3xl relative p-12 mt-4 border-2 border-dashed rounded-2xl transition-all duration-300 ease-out flex flex-col items-center justify-center text-center cursor-pointer
                    ${dragActive ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 bg-gray-50/30'}
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
                  
                  <motion.div 
                     whileHover={{ scale: 1.05 }}
                     className="p-4 bg-white shadow-sm border border-gray-100 rounded-2xl mb-4 text-blue-600"
                  >
                    <FiUploadCloud className="w-8 h-8" />
                  </motion.div>
                  
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Click to upload or drag and drop
                  </h3>
                  <p className="text-xs text-gray-500">
                    Supported formats: PDF, TXT, MD, CSV (Max size: 50MB)
                  </p>
                </div>

                <AnimatePresence>
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-3xl mt-6 p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                          <FiFileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      {!uploading && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {uploading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="w-full max-w-3xl mt-6"
                  >
                    <div className="flex justify-between text-xs font-medium mb-2 text-gray-700">
                      <span>Uploading & Vectorizing...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="bg-blue-600 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="w-full max-w-3xl mt-8 flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      !file || uploading
                        ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : 'bg-blue-900 hover:bg-blue-800 text-white shadow-md hover:shadow-lg shadow-blue-900/20'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-4 h-4" />
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
              initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-12 text-center text-gray-500 bg-white border border-gray-100 rounded-2xl shadow-sm"
            >
              <div className="inline-flex p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-4">
                <FiDatabase className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Coming Soon</h3>
              <p className="mt-1 text-xs">This section is currently under construction.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

