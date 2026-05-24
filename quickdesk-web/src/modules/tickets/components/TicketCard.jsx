
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const statusColors = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  closed: 'bg-gray-100 text-gray-800 border-slate-200',
};

export default function TicketCard({ ticket, onView }) {
  const screenshots = ticket.screenshots || [];
  const visibleScreenshots = screenshots.slice(0, 3);
  const overflow = screenshots.length - visibleScreenshots.length;

  const content = (
    <div className="bg-white h-full rounded-xl  border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 mr-3">{ticket.title}</h3>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[ticket.status] || statusColors.open}`}>
          {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}
        </span>
      </div>

      {/* Description */}
      <div className="flex-1">
        <p className="text-sm text-gray-600 line-clamp-3">{ticket.description}</p>
      </div>

      {/* Screenshots strip */}
      {visibleScreenshots.length > 0 && (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            {visibleScreenshots.map((filename, idx) => (
              <div
                key={idx}
                className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-gray-50 shrink-0"
              >
                <img
                  src={`${API_BASE}/uploads/${filename}`}
                  alt={`screenshot ${idx + 1}`}
                  className="object-contain w-full h-full bg-white p-0.5"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ))}
            {overflow > 0 && (
              <div className="w-16 h-12 rounded-lg border border-slate-200 bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-gray-500">+{overflow}</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {ticket.customer?.name || 'Customer'}
        </div>
        <div>{new Date(ticket.createdAt).toLocaleDateString()}</div>
      </div>
    </div>
  );

  if (onView) {
    return (
      <div onClick={() => onView(ticket)} className="block h-full">
        {content}
      </div>
    );
  }

  return (
    <Link to={`/tickets/${ticket.id || ticket._id}`} className="block h-full">
      {content}
    </Link>
  );
}
