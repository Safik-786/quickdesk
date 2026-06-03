import Slideover from '../../core/components/ui/Slideover';
import AuditLogTable from './AuditLogTable';

export default function AuditLogSlideover({ isOpen, onClose, ticket }) {
  if (!ticket) return null;

  const logCount = ticket.auditLogs?.length || 0;

  return (
    <Slideover
      isOpen={isOpen}
      onClose={onClose}
      title="Ticket History"
      size="md"
    >
      <div className="pt-2">
        {/* Ticket summary card */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{ticket.title}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5 font-mono">ID: {ticket.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
              {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
            </span>
            {(ticket.agentCategory || ticket.aiCategory) && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {ticket.agentCategory || ticket.aiCategory}
              </span>
            )}
            {(ticket.agentPriority || ticket.aiPriority) && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                {ticket.agentPriority || ticket.aiPriority}
              </span>
            )}
          </div>
        </div>

        {/* Timeline header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activity Timeline
          </h3>
          {logCount > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {logCount} {logCount === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>

        <AuditLogTable logs={ticket.auditLogs} />
      </div>
    </Slideover>
  );
}
