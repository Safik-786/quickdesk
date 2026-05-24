import Slideover from '../../core/components/ui/Slideover';
import AuditLogTable from './AuditLogTable';

export default function AuditLogSlideover({ isOpen, onClose, ticket }) {
  if (!ticket) return null;

  return (
    <Slideover
      isOpen={isOpen}
      onClose={onClose}
      title="Ticket History"
      size="md"
    >
      <div className="pt-2">
        <div className="bg-gray-50 border border-slate-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 text-sm mb-1">Ticket Details</h3>
          <p className="text-xs text-gray-500 mb-2">ID: {ticket.id}</p>
          <div className="flex gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {ticket.status}
            </span>
            {ticket.agentCategory && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {ticket.agentCategory}
              </span>
            )}
            {ticket.agentPriority && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                {ticket.agentPriority}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Audit Logs
        </h3>
        <AuditLogTable logs={ticket.auditLogs} />
      </div>
    </Slideover>
  );
}
