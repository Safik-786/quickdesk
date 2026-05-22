
import { Link } from 'react-router-dom';

export default function TicketCard({ ticket }) {
  const statusColors = {
    open: 'bg-amber-100 text-amber-800 border-amber-200',
    resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <Link to={`/tickets/${ticket.id || ticket._id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{ticket.title}</h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[ticket.status] || statusColors.open}`}>
            {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{ticket.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {ticket.customer?.name || 'Customer'}
          </div>
          <div>
            {new Date(ticket.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  );
}
