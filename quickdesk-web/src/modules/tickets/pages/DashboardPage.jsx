
import { useState } from 'react';
import { useAllTickets } from '../tickets.hooks';
import TicketCard from '../components/TicketCard';
import TicketTable from '../components/TicketTable';
import FilterBar from '../components/FilterBar';
import PageHeader from '../../../components/ui/PageHeader';

export default function DashboardPage() {
  const [filters, setFilters] = useState({ status: '', search: '', date: '', page: 1, limit: 10 });
  const [viewType, setViewType] = useState('card');
  const { data: response, isLoading, error } = useAllTickets(filters);

  const tickets = response?.data || [];
  const totalPages = response?.totalPages || 1;
  const currentPage = response?.page || 1;
  const totalItems = response?.total || 0;

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-white rounded-xl shadow">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:p-6">
        <PageHeader 
          title="Agent Dashboard" 
          description="Manage and respond to customer tickets."
        />

        <div className="mb-6">
          <FilterBar 
            filters={filters} 
            setFilters={setFilters} 
            viewType={viewType}
            setViewType={setViewType}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
            {error.message}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
            <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : viewType === 'table' ? (
          <TicketTable 
            tickets={tickets} 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tickets.map(ticket => (
                <TicketCard key={ticket.id || ticket._id} ticket={ticket} />
              ))}
            </div>
            {/* Simple pagination for card view as well */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 text-sm font-medium hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700 flex items-center">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 text-sm font-medium hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
