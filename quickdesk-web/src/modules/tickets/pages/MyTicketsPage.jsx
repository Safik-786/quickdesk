
import { Link } from 'react-router-dom';
import { useMyTickets } from '../tickets.hooks';
import Navbar from '../../core/components/Navbar';
import TicketCard from '../components/TicketCard';

export default function MyTicketsPage() {
  const { data: tickets, isLoading, error } = useMyTickets();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
            <p className="text-gray-500 mt-2">Track the status of your reported issues.</p>
          </div>
          <Link
            to="/submit"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
            {error.message}
          </div>
        ) : tickets?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't submitted any tickets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets?.map(ticket => (
              <TicketCard key={ticket.id || ticket._id} ticket={ticket} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
