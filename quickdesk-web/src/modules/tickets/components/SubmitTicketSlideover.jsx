import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Slideover from '../../core/components/ui/Slideover';
import Input from '../../core/components/ui/Input';
import { useSubmitTicket, useEditTicket } from '../tickets.hooks';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function SubmitTicketSlideover({ isOpen, onClose, ticket, isEdit }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [screenshots, setScreenshots] = useState([]);
  const [fileError, setFileError] = useState('');
  const { mutate: submitTicket, isPending: isSubmitting, error: submitError, isSuccess: isSubmitSuccess } = useSubmitTicket();
  const { mutate: editTicket, isPending: isEditing, error: editError, isSuccess: isEditSuccess } = useEditTicket(ticket?.id || ticket?._id);

  const isPending = isEdit ? isEditing : isSubmitting;
  const error = isEdit ? editError : submitError;
  const isSuccess = isEdit ? isEditSuccess : isSubmitSuccess;

  // Reset or prefill form when opened
  useEffect(() => {
    if (isOpen) {
      if (isEdit && ticket) {
        setForm({
          title: ticket.title || '',
          description: ticket.description || '',
        });
        
        if (ticket.screenshots && Array.isArray(ticket.screenshots)) {
          setScreenshots(ticket.screenshots.map(filename => ({
            file: null,
            previewUrl: `http://localhost:3000/uploads/${filename}`,
            isExisting: true
          })));
        } else {
          setScreenshots([]);
        }
      } else {
        setForm({ title: '', description: '' });
        setScreenshots([]);
        setFileError('');
      }
    }
  }, [isOpen, isEdit, ticket]);

  // Clean up ObjectURLs to avoid memory leaks
  useEffect(() => {
    return () => {
      screenshots.forEach(file => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, [screenshots]);

  // Close when successfully submitted
  useEffect(() => {
    if (isSuccess && isOpen) {
      toast.success(isEdit ? 'Ticket updated successfully!' : 'Ticket created successfully!');
      onClose();
    }
  }, [isSuccess, isOpen, onClose, isEdit]);

  const handleFileChange = (e) => {
    setFileError('');
    const files = Array.from(e.target.files);
    const validFiles = [];
    let hasError = false;

    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        hasError = true;
      } else {
        validFiles.push({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    });

    if (hasError) {
      setFileError('One or more files exceed the 5MB size limit and were not added.');
    }

    setScreenshots(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setScreenshots(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = (e) => {
    // If triggered via form submit or button click
    if (e && e.preventDefault) e.preventDefault();

    // Basic validation
    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    if (isEdit) {
      editTicket({ title: form.title, description: form.description });
    } else {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);

      screenshots.forEach(s => {
        if (s.file) {
          formData.append('screenshots', s.file);
        }
      });
      submitTicket(formData);
    }
  };

  return (
    <Slideover
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Ticket' : 'Create New Ticket'}
      primaryBtnText={isEdit ? 'Save Changes' : 'Submit Ticket'}
      onPrimaryClick={handleSubmit}
      primaryBtnLoading={isPending}
      secondaryBtnText="Cancel"
    >
      <form id="submit-ticket-form" onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-gray-500 mb-2">
          Describe your issue and we'll get back to you shortly.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error.message}
          </div>
        )}

        <Input
          label="Subject"
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Brief description of the issue"
        />

        <Input
          label="Description"
          rows={6}
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Please provide as much detail as possible..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isEdit ? 'Attached Screenshots' : 'Screenshots (Max 5MB each)'}
          </label>
          
          {!isEdit && (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors bg-white">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                    <span>Upload files</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          )}
          {fileError && !isEdit && <p className="mt-2 text-sm text-red-600">{fileError}</p>}

          {screenshots.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {screenshots.map((s, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200">
                  <img src={s.previewUrl} alt="preview" className="object-cover w-full h-24" />
                  {!s.isExisting && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Slideover>
  );
}
