import { useState, useEffect } from 'react';
import Slideover from '../../core/components/ui/Slideover';
import Input from '../../core/components/ui/Input';
import { useSubmitTicket } from '../tickets.hooks';

export default function SubmitTicketSlideover({ isOpen, onClose }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const { mutate: submitTicket, isPending, error, isSuccess } = useSubmitTicket();

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setForm({ title: '', description: '' });
    }
  }, [isOpen]);

  // Close when successfully submitted
  useEffect(() => {
    if (isSuccess && isOpen) {
      onClose();
    }
  }, [isSuccess, isOpen, onClose]);

  const handleSubmit = (e) => {
    // If triggered via form submit or button click
    if (e && e.preventDefault) e.preventDefault();
    
    // Basic validation
    if (!form.title.trim() || !form.description.trim()) {
      return;
    }
    
    submitTicket(form);
  };

  return (
    <Slideover 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create New Ticket"
      primaryBtnText="Submit Ticket"
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
      </form>
    </Slideover>
  );
}
