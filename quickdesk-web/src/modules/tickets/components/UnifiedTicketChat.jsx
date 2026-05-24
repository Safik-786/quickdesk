import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Button from '../../core/components/ui/Button';
import Dropdown from '../../core/components/ui/Dropdown';
import Modal from '../../core/components/ui/Modal';
import { useReplyTicket, useTicketDraft, useOverrideTicket, useResolveTicket } from '../tickets.hooks';
import RichTextEditor, { FormattedText } from './RichTextEditor';
import AIDraftEditor from './AIDraftEditor';
import AIDraftLoader from './AIDraftLoader';
import AuditLogSlideover from './AuditLogSlideover';
import { parseMarkdownToHtml } from '../utils/markdown';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
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

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function UnifiedTicketChat({ ticket, isAgent = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const { mutate: replyTicket, isPending: isReplying } = useReplyTicket(ticket?.id);
  const { mutate: overrideTicket, isPending: isOverriding } = useOverrideTicket(ticket?.id);
  const { mutate: resolveTicket, isPending: isResolving } = useResolveTicket(ticket?.id);
  const { data: draft, refetch: getDraft, isFetching: isDraftLoading } = useTicketDraft(ticket?.id, { enabled: false });

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  // Initialize messages from ticket.replies
  useEffect(() => {
    if (ticket?.replies) {
      setMessages(ticket.replies);
    } else if (ticket?.finalReply) {
      // Fallback for legacy tickets
      setMessages([{
        id: 'legacy-1',
        message: ticket.finalReply,
        user: ticket.resolvedBy || { name: 'Support Agent', id: 'system' },
        createdAt: ticket.resolvedAt || ticket.updatedAt
      }]);
    } else {
      setMessages([]);
    }
  }, [ticket]);

  // WebSocket connection
  useEffect(() => {
    if (!ticket?.id) return;

    const socket = io(API_BASE, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('joinTicket', ticket.id);
    });

    socket.on('ticket:reply', (newReply) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newReply.id)) return prev;
        return [...prev, newReply];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [ticket?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyTicket(replyText, {
      onSuccess: () => {
        setReplyText('');
        if (isAgent) {
          toast.success('Reply sent successfully!');
        }
      },
    });
  };

  if (!ticket) return null;

  const isTicketClosed = ticket.status === 'resolved' || ticket.status === 'closed';
  const initialTicketIsMe = ticket.employee?.id === user?.id;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden rounded-xl shadow-sm  overflow-hidden relative">

      {/* Header */}
      <div className="px-2 py-2 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className='p-1 bg-blue-50 rounded-xl'>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className=""
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Button>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm uppercase">{ticket.title}</h2>
            <p className="text-[8px] uppercase text-gray-500">Ticket #{ticket.id.substring(0, 8)} • Reported by <span className='text-blue-500 font-bold'>{ticket.employee?.name || 'User'}</span></p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {!isTicketClosed && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => resolveTicket()}
              isLoading={isResolving}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200"
              iconLeft={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Resolve
            </Button>
          )}

          {/* Horizontal Actions (Agent Only) */}
          {isAgent && (
            <div className="flex items-center py-2 gap-3">
            <div className="w-32">
              <Dropdown
                value={ticket.status}
                onChange={(status) => overrideTicket({ status })}
                options={STATUS_OPTIONS}
                disabled={isOverriding}
                size="xs"
              />
            </div>
            <div className="w-32">
              <Dropdown
                value={ticket.agentCategory || ticket.aiCategory || 'Other'}
                onChange={(category) => overrideTicket({ category })}
                options={CATEGORY_OPTIONS}
                disabled={isOverriding}
                size="xs"
              />
            </div>
            <div className="w-32">
              <Dropdown
                value={ticket.agentPriority || ticket.aiPriority || 'Low'}
                onChange={(priority) => overrideTicket({ priority })}
                options={PRIORITY_OPTIONS}
                disabled={isOverriding}
                size="xs"
              />
            </div>
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuditOpen(true)}
              className="text-slate-600 hover:text-slate-900 border-slate-300 bg-white"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View History
            </Button>
          </div>
        )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto border-x border-slate-200 p-4 space-y-2 bg-slate-50">
        {/* Initial Ticket Message */}
        <div className={`flex flex-col w-full ${initialTicketIsMe ? 'items-end' : 'items-start'}`}>
          <div className={`flex items-center mb-1 gap-2 ${initialTicketIsMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className='rounded-full p-1 bg-blue-50 shrink-0'>
              <div className='h-6 w-6 rounded-full flex justify-center items-center bg-white shadow'>
                {initialTicketIsMe ? (
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <p className="text-xs font-bold text-blue-600 uppercase">
                    {ticket.employee?.name?.charAt(0) || 'E'}
                  </p>
                )}
              </div>
            </div>
            <div className={`flex flex-col ${initialTicketIsMe ? 'items-end' : 'items-start'}`}>
              <span className="text-xs font-semibold text-gray-500">
                {initialTicketIsMe ? 'You' : ticket.employee?.name || 'Employee'}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className={`rounded-3xl  p-4 w-[85%] sm:w-[75%] border ${initialTicketIsMe
            ? 'bg-blue-50 text-blue-950 border-blue-200 rounded-tr-sm'
            : 'bg-white text-gray-800 border-slate-200 rounded-tl-sm'
            }`}>
            <div className={`prose prose-sm max-w-none whitespace-pre-wrap`}>
              {ticket.description}
            </div>

            {/* Screenshots */}
            {ticket.screenshots && ticket.screenshots.length > 0 && (
              <div className={`mt-2 pt-2 border-t ${initialTicketIsMe ? 'border-indigo-400/30' : 'border-slate-100'}`}>
                <h4 className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${initialTicketIsMe ? 'text-indigo-200' : 'text-gray-400'}`}>Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {ticket.screenshots.map((filename, idx) => (
                    <a
                      key={idx}
                      href={`${API_BASE}/uploads/${filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-20 h-20 rounded-md overflow-hidden bg-white/10 hover:opacity-80 transition border border-black/10"
                    >
                      <img
                        src={`${API_BASE}/uploads/${filename}`}
                        alt="attachment"
                        className="object-cover w-full h-full bg-white"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {messages.map((msg, idx) => {
          const isMe = msg.user?.id === user?.id;

          return (
            <div key={msg.id || idx} className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center mb-1 gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className='rounded-full p-1 bg-blue-50 shrink-0'>
                  <div className='h-6 w-6 rounded-full flex justify-center items-center bg-white'>
                    {isMe ? (
                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <p className="text-xs font-bold text-blue-600 uppercase">
                        {msg.user?.name?.charAt(0) || 'U'}
                      </p>
                    )}
                  </div>
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs font-semibold text-gray-500">
                    {isMe ? 'You' : msg.user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className={`rounded-3xl p-4 max-w-[85%] sm:max-w-[75%] border ${isMe
                ? 'bg-blue-50 text-blue-950 border-blue-200 rounded-tr-sm'
                : 'bg-white border-slate-200 text-gray-800 rounded-tl-sm'
                }`}>
                <div className={`prose prose-sm max-w-none`}>
                  <FormattedText text={msg.message} />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input / Agent Notepad Area */}
      <div className="bg-white border-t border-slate-200 p-2 shrink-0 relative">

        {/* Agent AI Draft Modal */}
        <Modal 
          isOpen={isDraftModalOpen} 
          onClose={() => setIsDraftModalOpen(false)}
          title="AI Suggested Reply"
          maxWidth="max-w-2xl"
          footer={
            draft?.draft && !isDraftLoading && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    setReplyText(parseMarkdownToHtml(draft.draft));
                    setIsDraftModalOpen(false);
                    toast.success('Draft injected into input!');
                  }}
                >
                  Use Suggestion
                </Button>
              </div>
            )
          }
        >
          {isDraftLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-gray-500">Generating AI suggestion...</p>
            </div>
          ) : draft?.draft ? (
            <AIDraftEditor
              draftText={draft.draft}
              citations={draft.citations || ticket.citations || []}
            />
          ) : (
            <div className="py-8 text-center text-gray-500">Failed to generate AI suggestion.</div>
          )}
        </Modal>

        {isTicketClosed ? (
          <div className="text-center text-sm text-gray-500 italic py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            This ticket has been resolved. The thread is closed.
          </div>
        ) : (
          <div className="space-y-3">
            <RichTextEditor
              value={replyText}
              onChange={setReplyText}
              placeholder="Type your message here..."
              ticketInfo={ticket}
              showHeader={false}
              centerToolbarContent={
                isAgent ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsDraftModalOpen(true);
                      getDraft();
                    }}
                    disabled={isDraftLoading}
                    isLoading={isDraftLoading}
                    className="text-indigo-600 whitespace-nowrap hover:text-indigo-800 hover:bg-indigo-50 !px-2 !py-1 h-7 text-xs ml-1"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {isDraftLoading ? 'Generating...' : 'AI Reply'}
                  </Button>
                ) : null
              }
              endToolbarContent={
                <div className="pl-2 ml-1 border-l border-slate-200 h-6 flex items-center">
                  <div className='p-1 bg-blue-50 rounded-xl'>
                    <Button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      isLoading={isReplying}
                      size="sm"
                      className="px-4 shadow-sm h-7 text-xs flex items-center"
                    >
                      <span>Send</span>
                      <svg className="w-3.5 h-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
        )}
      </div>

      <AuditLogSlideover
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        ticket={ticket}
      />
    </div>
  );
}
