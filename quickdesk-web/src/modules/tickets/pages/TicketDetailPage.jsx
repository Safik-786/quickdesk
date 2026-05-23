
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket, useTicketDraft, useReplyTicket, useOverrideTicket } from '../tickets.hooks';
import AuditLogTable from '../components/AuditLogTable';
import AIDraftEditor from '../components/AIDraftEditor';
import Input from '../../core/components/ui/Input';
import Button from '../../core/components/ui/Button';
import Dropdown from '../../core/components/ui/Dropdown';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const backIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');
  
  const { data: ticket, isLoading, error } = useTicket(id);
  const { data: draft, refetch: getDraft, isFetching: isDraftLoading } = useTicketDraft(id);
  const { mutate: replyTicket, isPending: isReplying } = useReplyTicket(id);
  const { mutate: overrideTicket, isPending: isOverriding } = useOverrideTicket(id);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full"></div></div>;
  if (error) return <div className="p-8 text-red-600 text-center">Error loading ticket: {error.message}</div>;
  if (!ticket) return null;

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyTicket(replyText, {
      onSuccess: () => setReplyText(''),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          iconLeft={backIcon}
          className="mb-6 !px-0 text-indigo-600 hover:text-indigo-800 hover:bg-transparent"
        >
          Back to list
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header & Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                <span className="px-3 py-1 rounded-full text-sm font-medium border bg-blue-50 text-blue-800 border-blue-200">
                  {ticket.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                <div>Reported by: <span className="font-medium text-gray-900">{ticket.customer?.name}</span></div>
                <div>{new Date(ticket.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* AI Draft Section */}
            {draft?.replyDraft && (
              <AIDraftEditor 
                draftText={draft.replyDraft} 
                onApply={(text) => setReplyText(text)} 
              />
            )}

            {/* Reply Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Reply</h3>
              <Input
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response here..."
                className="mb-4"
              />
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => getDraft()}
                  disabled={isDraftLoading}
                  isLoading={isDraftLoading}
                  className="!px-0 text-indigo-600 hover:text-indigo-800 hover:bg-transparent"
                >
                  {isDraftLoading ? 'Generating...' : 'Generate AI Suggestion'}
                </Button>
                <Button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  isLoading={isReplying}
                >
                  Send Reply
                </Button>
              </div>
            </div>
            
            {/* Replies List */}
            {ticket.replies && ticket.replies.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Conversation History</h3>
                {ticket.replies.map((r, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-900">{r.user || 'User'}</span>
                      <span className="text-gray-500">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Actions Sidebar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Actions</h3>
              
              <Dropdown
                label="Change Status"
                value={ticket.status}
                onChange={(status) => overrideTicket({ status })}
                options={STATUS_OPTIONS}
                disabled={isOverriding}
              />
            </div>

            {/* Audit Log */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Log</h3>
              <AuditLogTable logs={ticket.auditLog} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
