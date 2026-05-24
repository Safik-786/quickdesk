
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket, useTicketDraft, useReplyTicket, useOverrideTicket } from '../tickets.hooks';
import AuditLogTable from '../components/AuditLogTable';
import AIDraftEditor from '../components/AIDraftEditor';
import Button from '../../core/components/ui/Button';
import Dropdown from '../../core/components/ui/Dropdown';
import RichTextEditor, { FormattedText } from '../components/RichTextEditor';
import { parseMarkdownToHtml } from '../utils/markdown';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const CATEGORY_OPTIONS = [
  { value: 'IT', label: 'IT' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
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
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const { data: ticket, isLoading, error } = useTicket(id);
  const { data: draft, refetch: getDraft, isFetching: isDraftLoading } = useTicketDraft(id);
  const { mutate: replyTicket, isPending: isReplying } = useReplyTicket(id);
  const { mutate: overrideTicket, isPending: isOverriding } = useOverrideTicket(id);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;
  if (error) return <div className="p-8 text-red-600 text-center">Error loading ticket: {error.message}</div>;
  if (!ticket) return null;

  const screenshots = ticket.screenshots || [];

  const replies = ticket.replies && ticket.replies.length > 0
    ? ticket.replies
    : ticket.finalReply
      ? [
          {
            user: ticket.resolvedBy?.name || 'Support Agent',
            text: ticket.finalReply,
            createdAt: ticket.resolvedAt || ticket.updatedAt || ticket.createdAt,
          }
        ]
      : [];

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyTicket(replyText, {
      onSuccess: () => {
        setReplyText('');
        toast.success('Reply sent and ticket resolved successfully! 🎉');
      },
    });
  };

  return (
    <div className="min-h-screen bg-white rounded-xl shadow">
      <main className="max-w-7xl mx-auto sm:p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          iconLeft={backIcon}
          className="mb-6 uppercase !px-0 text-blue-800 hover:text-blue-800 hover:bg-transparent"
        >
          Back to list
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header & Info */}
            <div className="bg-white rounded-xl  border border-slate-200 p-4">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
                <span className="px-3 py-1 rounded-full text-[12px] font-medium border bg-blue-50 text-blue-800 border-blue-200">
                  {ticket.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>

              {/* Screenshots Gallery */}
              {screenshots.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Screenshots ({screenshots.length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {screenshots.map((filename, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLightboxIdx(idx)}
                        className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-gray-50 hover:ring-2 hover:ring-blue-400 transition group"
                      >
                        <img
                          src={`${API_BASE}/uploads/${filename}`}
                          alt={`screenshot ${idx + 1}`}
                          className="object-contain w-full h-full bg-white"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                <div>Reported by: <span className="font-medium text-gray-900">{ticket.customer?.name}</span></div>
                <div>{new Date(ticket.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxIdx !== null && (
              <div
                className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
                onClick={() => setLightboxIdx(null)}
              >
                <div className="relative max-w-5xl w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white/5 ring-1 ring-white/10">
                    {/* Add a subtle checkerboard pattern for transparent images */}
                    <div className="absolute inset-0" style={{ backgroundImage: 'conic-gradient(rgba(255,255,255,0.1) 90deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.1) 180deg, rgba(255,255,255,0.1) 270deg, transparent 270deg)', backgroundSize: '20px 20px', opacity: 0.5, zIndex: -1 }}></div>
                    <img
                      src={`${API_BASE}/uploads/${screenshots[lightboxIdx]}`}
                      alt={`screenshot ${lightboxIdx + 1}`}
                      className="max-h-[85vh] w-auto max-w-full object-contain"
                    />
                  </div>
                  {/* Close */}
                  <button
                    onClick={() => setLightboxIdx(null)}
                    className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
                  >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {/* Prev */}
                  {lightboxIdx > 0 && (
                    <button
                      onClick={() => setLightboxIdx(i => i - 1)}
                      className="absolute -left-16 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2"
                    >
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {/* Next */}
                  {lightboxIdx < screenshots.length - 1 && (
                    <button
                      onClick={() => setLightboxIdx(i => i + 1)}
                      className="absolute -right-16 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2"
                    >
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  {/* Counter */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-wide">
                    {lightboxIdx + 1} / {screenshots.length}
                  </div>
                </div>
              </div>
            )}

            {/* AI Draft Section */}
            {draft?.draft && (
              <AIDraftEditor
                draftText={draft.draft}
                citations={draft.citations || ticket.citations || []}
                onApply={(text) => setReplyText(parseMarkdownToHtml(text))}
              />
            )}

            {/* Reply Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-2">
              <h3 className="text-lg mt-2 font-bold bg-gradient-to-br from-cyan-600 via-blue-700 to-blue-900 text-transparent bg-clip-text mb-4">Add Reply</h3>
              <div className="mb-4">
                <RichTextEditor
                  value={replyText}
                  onChange={setReplyText}
                  placeholder="Type your response here..."
                  ticketInfo={ticket}
                />
              </div>
              <div className="flex justify-between items-center mt-4">
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
            {replies && replies.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Conversation History</h3>
                {replies.map((r, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 ">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-900">{r.user || 'User'}</span>
                      <span className="text-gray-500">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <FormattedText text={r.text} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Actions Sidebar */}
            <div className="bg-white rounded-xl  border border-slate-200 p-4">
              <h3 className="text-lg font-bold bg-gradient-to-br from-cyan-600 via-blue-700 to-blue-900 text-transparent bg-clip-text mb-4">Ticket Actions</h3>

              <Dropdown
                label="Change Status"
                value={ticket.status}
                onChange={(status) => overrideTicket({ status })}
                options={STATUS_OPTIONS}
                disabled={isOverriding}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Dropdown
                  label={
                    <span className="flex justify-between items-center w-full">
                      <span>Category</span>
                      {!ticket.agentCategory && ticket.aiCategory && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">AI</span>
                      )}
                    </span>
                  }
                  value={ticket.agentCategory || ticket.aiCategory || 'Other'}
                  onChange={(category) => overrideTicket({ category })}
                  options={CATEGORY_OPTIONS}
                  disabled={isOverriding}
                />
                <Dropdown
                  label={
                    <span className="flex justify-between items-center w-full">
                      <span>Priority</span>
                      {!ticket.agentPriority && ticket.aiPriority && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">AI</span>
                      )}
                    </span>
                  }
                  value={ticket.agentPriority || ticket.aiPriority || 'Low'}
                  onChange={(priority) => overrideTicket({ priority })}
                  options={PRIORITY_OPTIONS}
                  disabled={isOverriding}
                />
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white rounded-xl  border border-slate-200 p-2">
              <h3 className="text-lg font-bold bg-gradient-to-br from-cyan-600 via-blue-700 to-blue-900 text-transparent bg-clip-text mb-4">Audit Log</h3>
              <AuditLogTable logs={ticket.auditLogs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
