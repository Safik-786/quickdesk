
const ACTION_CONFIG = {
  TICKET_CREATED: {
    label: 'Ticket Created',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  STATUS_CHANGED: {
    label: 'Status Changed',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: 'bg-blue-100 text-blue-600 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  CATEGORY_OVERRIDE: {
    label: 'Category Override',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: 'bg-purple-100 text-purple-600 border-purple-200',
    dotColor: 'bg-purple-500',
  },
  PRIORITY_OVERRIDE: {
    label: 'Priority Override',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
    color: 'bg-orange-100 text-orange-600 border-orange-200',
    dotColor: 'bg-orange-500',
  },
  REPLY_SENT: {
    label: 'Reply Sent',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  TICKET_RESOLVED: {
    label: 'Ticket Resolved',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  OVERRIDE: {
    label: 'Override',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    dotColor: 'bg-gray-500',
  },
};

const VALUE_PILL_COLORS = {
  // Statuses
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  // Priorities
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  High: 'bg-red-50 text-red-700 border-red-200',
  // Categories
  IT: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  HR: 'bg-pink-50 text-pink-700 border-pink-200',
  Finance: 'bg-green-50 text-green-700 border-green-200',
  Admin: 'bg-violet-50 text-violet-700 border-violet-200',
  Other: 'bg-gray-50 text-gray-600 border-gray-200',
};

function ValuePill({ value }) {
  if (!value) return null;
  const colorClass = VALUE_PILL_COLORS[value] || 'bg-gray-50 text-gray-600 border-gray-200';
  const displayValue = value === 'in_progress' ? 'In Progress' : value;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colorClass}`}>
      {displayValue}
    </span>
  );
}

function StateChange({ from, to, action }) {
  // For REPLY_SENT, show a preview of the message instead of state pills
  if (action === 'REPLY_SENT' && to) {
    return (
      <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">
        "{to}"
      </p>
    );
  }

  // For TICKET_CREATED, just show the initial state
  if (action === 'TICKET_CREATED') {
    return (
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="text-[10px] text-gray-400 uppercase font-medium">Status:</span>
        <ValuePill value={to} />
      </div>
    );
  }

  // For overrides and status changes, show from → to
  if (!from && !to) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
      {from && <ValuePill value={from} />}
      {from && to && (
        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      )}
      {to && <ValuePill value={to} />}
    </div>
  );
}

function relativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function AuditLogTable({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-8 text-center border border-dashed border-slate-200 rounded-xl">
        <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        No history available yet
      </div>
    );
  }

  // Sort logs chronologically (oldest first for timeline)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
  );

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />

      <div className="space-y-0">
        {sortedLogs.map((log, idx) => {
          const actionKey = log.action || 'OVERRIDE';
          const config = ACTION_CONFIG[actionKey] || ACTION_CONFIG.OVERRIDE;
          const isLast = idx === sortedLogs.length - 1;

          return (
            <div
              key={log.id || idx}
              className={`relative flex items-start gap-3 py-3 px-1 ${isLast ? '' : ''}`}
            >
              {/* Timeline dot */}
              <div className="relative z-10 shrink-0">
                <div className={`w-[34px] h-[34px] rounded-full border-2 border-white shadow-sm flex items-center justify-center ${config.color}`}>
                  {config.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      by <span className="font-medium text-gray-700">{log.agent?.name || 'System'}</span>
                    </p>
                  </div>
                  <span
                    className="text-[11px] text-gray-400 shrink-0 tabular-nums cursor-default"
                    title={new Date(log.changedAt).toLocaleString()}
                  >
                    {relativeTime(log.changedAt)}
                  </span>
                </div>

                {/* State change pills */}
                <StateChange
                  from={log.fromValue}
                  to={log.toValue}
                  action={actionKey}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
