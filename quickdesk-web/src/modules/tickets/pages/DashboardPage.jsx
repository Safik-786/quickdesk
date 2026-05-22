
import { useState } from 'react';
import { useAllTickets } from '../tickets.hooks';
import Navbar from '../../core/components/Navbar';
import TicketCard from '../components/TicketCard';
import FilterBar from '../components/FilterBar';

export default function DashboardPage() {
  const [filters, setFilters] = useState({ status: '', search: '' });
  const { data: tickets, isLoading, error } = useAllTickets(filters);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage and respond to customer tickets.</p>
        </div>

        <div className="mb-6">
          <FilterBar filters={filters} setFilters={setFilters} />
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
            <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tickets?.map(ticket => (
              <TicketCard key={ticket.id || ticket._id} ticket={ticket} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
