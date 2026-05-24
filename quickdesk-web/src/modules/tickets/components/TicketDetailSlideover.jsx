import Slideover from '../../core/components/ui/Slideover';
import { FormattedText } from './RichTextEditor';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const statusColors = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  closed: 'bg-gray-100 text-gray-800 border-slate-200',
};

export default function TicketDetailSlideover({ isOpen, onClose, ticket }) {
  if (!ticket) return null;

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

        {/* Agent Response / Chat Interface (Left Side) */}
        {ticket.finalReply ? (
          <div className="flex justify-start items-start gap-4">
            {/* Profile Icon (Agent) */}
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-200 shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>

            <div className="flex flex-col items-start max-w-[85%]">
              <span className="text-xs font-medium text-gray-500 mb-1 ml-2">Support Agent</span>
              <div className="bg-gray-50 text-gray-800 rounded-2xl rounded-tl-sm shadow-md p-4 border border-slate-200">
                <div className="prose prose-sm max-w-none">
                  <FormattedText text={ticket.finalReply} />
                </div>
                {ticket.resolvedAt && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                    <span className="text-xs text-emerald-600 font-medium">
                      Resolved on {new Date(ticket.resolvedAt).toLocaleDateString()} at {new Date(ticket.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-start items-start gap-4 mt-4">
            {/* Profile Icon (Agent - Placeholder) */}
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-slate-200 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-gray-400 mb-1 ml-2">System</span>
              <div className="bg-gray-50 border border-slate-200 border-dashed rounded-2xl rounded-tl-sm shadow-sm p-4 text-center">
                <p className="text-sm text-gray-500 italic">Ticket is currently being reviewed by an agent.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Slideover>
  );
}
