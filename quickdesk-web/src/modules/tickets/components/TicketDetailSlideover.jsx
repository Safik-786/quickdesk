import { useState } from 'react';
import Slideover from '../../core/components/ui/Slideover';
import { FormattedText } from './RichTextEditor';
import TicketChatSlideover from './TicketChatSlideover';
import Button from '../../core/components/ui/Button';
import { useResolveTicket } from '../tickets.hooks';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const statusColors = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  closed: 'bg-gray-100 text-gray-800 border-slate-200',
};

export default function TicketDetailSlideover({ isOpen, onClose, ticket }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { mutate: resolveTicket, isPending: isResolving } = useResolveTicket(ticket?.id);

  if (!ticket) return null;

  const latestReply = ticket.replies && ticket.replies.length > 0 
    ? ticket.replies[ticket.replies.length - 1] 
    : ticket.finalReply 
      ? { message: ticket.finalReply, user: ticket.resolvedBy || { name: 'Support Agent' }, createdAt: ticket.resolvedAt || ticket.updatedAt }
      : null;

  const handleResolve = () => {
    resolveTicket(undefined, {
      onSuccess: () => {
        toast.success('Ticket marked as resolved!');
      }
    });
  };

  return (
    <Slideover
      isOpen={isOpen}
      onClose={onClose}
      title={`Ticket: ${ticket.title}`}
      size="lg"
      secondaryBtnText="Close"
      onSecondaryClick={onClose}
    >
      <div className="flex flex-col gap-6 pt-2">
        {/* Top Info Banner */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 flex items-center gap-2 shadow-sm border border-slate-200">
            <span>{new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-gray-300">•</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${statusColors[ticket.status] || statusColors.open} bg-white text-gray-800`}>
              {ticket.status}
            </span>
          </div>
        </div>

        {/* Employee Message (Right Side) */}
        <div className="flex justify-end items-start gap-4 mb-4">
          <div className="flex flex-col items-end max-w-[85%]">
            <span className="text-xs font-medium text-gray-500 mb-1 ml-2">{ticket.employee?.name || 'You'}</span>
            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md p-4">
              <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-indigo-400/30">{ticket.title}</h2>
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>

              {/* Screenshots */}
              {ticket.screenshots && ticket.screenshots.length > 0 && (
                <div className="mt-4 pt-4 border-t border-indigo-400/30">
                  <h4 className="text-xs font-semibold text-indigo-100 mb-2 uppercase tracking-wider">Attachments</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ticket.screenshots.map((filename, idx) => (
                      <a
                        key={idx}
                        href={`${API_BASE}/uploads/${filename}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block aspect-video rounded-md overflow-hidden bg-white/10 hover:bg-white/20 transition border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                      >
                        <img
                          src={`${API_BASE}/uploads/${filename}`}
                          alt={`Attachment ${idx + 1}`}
                          className="object-contain w-full h-full transition-opacity group-hover:opacity-75"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Icon (Employee) */}
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 border border-indigo-200 shadow-sm">
            {(ticket.employee?.name || 'You').charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Conversation Summary & Actions */}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800">Live Thread</h3>
            <div className="flex gap-2">
              {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  Mark as Resolved
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={() => setIsChatOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Open Chat
              </Button>
            </div>
          </div>

          {latestReply ? (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-indigo-700">{latestReply.user?.name || 'Agent'}</span>
                <span className="text-gray-500">{new Date(latestReply.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="text-sm text-gray-700 line-clamp-2">
                <FormattedText text={latestReply.message} />
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200 text-center">
              Agent is reviewing your ticket.
            </div>
          )}
        </div>

        <TicketChatSlideover 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          ticket={ticket}
        />
      </div>
    </Slideover>
  );
}
