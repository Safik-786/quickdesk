
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useDeleteTicket } from '../tickets.hooks';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const statusColors = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  closed: 'bg-gray-100 text-gray-800 border-slate-200',
};

export default function TicketCard({ ticket, onView, onEdit }) {
  const screenshots = ticket.screenshots || [];
  const visibleScreenshots = screenshots.slice(0, 3);
  const overflow = screenshots.length - visibleScreenshots.length;
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTicketMutation = useDeleteTicket(ticket.id || ticket._id);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteTicketMutation.mutateAsync();
    } finally {
      setIsDeleting(false);
    }
  };

  const content = (
    <div className="bg-white h-full rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col gap-3 group">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 mr-3">{ticket.title}</h3>
        <span className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-medium border ${statusColors[ticket.status] || statusColors.open}`}>
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
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div className=''>
            <div className='font-bold'>{ticket.customer?.name || 'Customer'}</div>
            <div className='text-[8px]'>{new Date(ticket.createdAt).toLocaleDateString()}</div>
          </div>

        </div>

        <div>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(ticket);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit ticket"
              disabled={ticket.status === 'in progress' || ticket.status === 'resolved'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete ticket"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
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
