import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Button from '../../core/components/ui/Button';
import { useAuth } from '../../core/hooks/useAuth';
import { useReplyTicket, useTicketDraft } from '../tickets.hooks';
import RichTextEditor, { FormattedText } from './RichTextEditor';
import AIDraftEditor from './AIDraftEditor';
import { parseMarkdownToHtml } from '../utils/markdown';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function UnifiedTicketChat({ ticket, isAgent = false }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  const { mutate: replyTicket, isPending: isReplying } = useReplyTicket(ticket?.id);
  const { data: draft, refetch: getDraft, isFetching: isDraftLoading } = useTicketDraft(ticket?.id, { enabled: false });

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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header (optional if you want a chat header) */}
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="font-semibold text-gray-900">{ticket.title}</h2>
          <p className="text-xs text-gray-500">Ticket #{ticket.id.substring(0, 8)} • {ticket.status.toUpperCase()}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
        
        {/* Initial Ticket Message */}
        <div className={`flex flex-col w-full ${initialTicketIsMe ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center mb-1">
            <span className={`text-xs font-semibold text-gray-500 ${initialTicketIsMe ? 'mr-2' : 'ml-2'}`}>
              {initialTicketIsMe ? 'You' : ticket.employee?.name || 'Employee'}
            </span>
            <span className="text-[10px] text-gray-400">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <div className={`rounded-2xl shadow-sm p-4 w-[85%] sm:w-[75%] border ${
            initialTicketIsMe 
              ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-sm' 
              : 'bg-white text-gray-800 border-slate-200 rounded-tl-sm'
          }`}>
            <div className={`prose prose-sm max-w-none whitespace-pre-wrap ${initialTicketIsMe ? 'prose-invert' : ''}`}>
              {ticket.description}
            </div>

            {/* Screenshots */}
            {ticket.screenshots && ticket.screenshots.length > 0 && (
              <div className={`mt-4 pt-4 border-t ${initialTicketIsMe ? 'border-indigo-400/30' : 'border-slate-100'}`}>
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
              <div className="flex items-center mb-1">
                <span className={`text-xs font-semibold text-gray-500 ${isMe ? 'mr-2' : 'ml-2'}`}>
                  {isMe ? 'You' : msg.user?.name || 'User'}
                </span>
                <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              <div className={`rounded-2xl shadow-sm p-4 max-w-[85%] sm:max-w-[75%] border ${
                isMe 
                  ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-sm' 
                  : 'bg-white border-slate-200 text-gray-800 rounded-tl-sm'
              }`}>
                <div className={`prose prose-sm max-w-none ${isMe ? 'prose-invert' : ''}`}>
                  <FormattedText text={msg.message} />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input / Agent Notepad Area */}
      <div className="bg-white border-t border-slate-200 p-4">
        
        {/* Agent AI Draft Section */}
        {isAgent && !isTicketClosed && draft?.draft && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Suggestion Notepad
            </h4>
            <AIDraftEditor
              draftText={draft.draft}
              citations={draft.citations || ticket.citations || []}
              onApply={(text) => setReplyText(parseMarkdownToHtml(text))}
            />
          </div>
        )}

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
            />
            
            <div className="flex justify-between items-center pt-2">
              {isAgent ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => getDraft()}
                  disabled={isDraftLoading}
                  isLoading={isDraftLoading}
                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 !px-3"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  {isDraftLoading ? 'Generating AI Suggestion...' : 'Generate AI Suggestion'}
                </Button>
              ) : (
                <div /> // Empty div to keep layout aligned
              )}
              
              <Button
                onClick={handleReply}
                disabled={!replyText.trim()}
                isLoading={isReplying}
                className="px-6 shadow-sm"
              >
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
