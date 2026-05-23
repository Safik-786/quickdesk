import { useState } from 'react';
import { useMyTickets } from '../tickets.hooks';
import TicketCard from '../components/TicketCard';
import TicketTable from '../components/TicketTable';
import FilterBar from '../components/FilterBar';
import Button from '../../core/components/ui/Button';
import SubmitTicketSlideover from '../components/SubmitTicketSlideover';
import TicketDetailSlideover from '../components/TicketDetailSlideover';
import PageHeader from '../../../components/ui/PageHeader';

const plusIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function MyTicketsPage() {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '', date: '', page: 1, limit: 10 });
  const [viewType, setViewType] = useState('card');
  const { data: response, isLoading, error } = useMyTickets(filters);

  const tickets = Array.isArray(response) ? response : (response?.data || []);
  const totalPages = response?.totalPages || 1;
  const currentPage = response?.page || 1;
  const totalItems = response?.total || tickets.length;

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-white rounded-xl shadow">
      <main className="max-w-7xl mx-auto px-4 sm:p-6">
        <div className="flex justify-between items-center">
          <PageHeader 
            title="My Tickets" 
            description="Track the status of your reported issues." 
            className="mb-0"
          />
          <Button iconLeft={plusIcon} onClick={() => setIsSubmitOpen(true)}>
            New Ticket
          </Button>
        </div>

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
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't submitted any tickets matching the filters.</p>
          </div>
        ) : viewType === 'table' ? (
          <TicketTable 
            tickets={tickets} 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onView={setSelectedTicket}
          />
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map(ticket => (
                <TicketCard key={ticket.id || ticket._id} ticket={ticket} onView={setSelectedTicket} />
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

        <SubmitTicketSlideover 
          isOpen={isSubmitOpen} 
          onClose={() => setIsSubmitOpen(false)} 
        />
        
        <TicketDetailSlideover 
          isOpen={!!selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          ticket={selectedTicket} 
        />
      </main>
    </div>
  );
}
