import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket, useOverrideTicket } from '../tickets.hooks';
import UnifiedTicketChat from '../components/UnifiedTicketChat';
import { useAuth } from '../../core/hooks/useAuth';


export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ticket, isLoading, error } = useTicket(id);
  const { mutate: overrideTicket, isPending: isOverriding } = useOverrideTicket(id);
  
  const { user } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;
  if (error) return <div className="p-8 text-red-600 text-center">Error loading ticket: {error.message}</div>;
  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto sm:p-6">
        {/* Full Page Chat Container */}
        <div className="h-[calc(100vh-80px)] w-full">
          <UnifiedTicketChat ticket={ticket} isAgent={true} />
        </div>
      </main>
    </div>
  );
}
