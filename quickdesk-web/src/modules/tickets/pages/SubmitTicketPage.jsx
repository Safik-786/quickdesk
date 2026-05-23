
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmitTicket } from '../tickets.hooks';
import Input from '../../core/components/ui/Input';
import Button from '../../core/components/ui/Button';

export default function SubmitTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const { mutate: submitTicket, isPending, error } = useSubmitTicket();

  const handleSubmit = (e) => {
    e.preventDefault();
    submitTicket(form, {
      onSuccess: () => navigate('/my-tickets'),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit a Ticket</h1>
          <p className="text-gray-500 mt-2">Describe your issue and we'll get back to you shortly.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/my-tickets')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isPending}
              >
                Submit Ticket
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
