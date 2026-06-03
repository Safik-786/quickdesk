import { useState } from 'react';
import Slideover from '../../core/components/ui/Slideover';
import UnifiedTicketChat from './UnifiedTicketChat';
import Button from '../../core/components/ui/Button';
import { useResolveTicket } from '../tickets.hooks';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const statusColors = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  closed: 'bg-gray-100 text-gray-800 border-slate-200',
};

export default function TicketDetailSlideover({ isOpen, onClose, ticket }) {
  const { mutate: resolveTicket, isPending: isResolving } = useResolveTicket(ticket?.id);

  if (!ticket) return null;

  const handleResolve = () => {
    resolveTicket(undefined, {
      onSuccess: () => {
        toast.success('Ticket marked as resolved!');
      }
    });
  };

  return (
    <Slideover
      isOpen={isOpen}
      onClose={onClose}
      title={`Ticket: ${ticket.title}`}
      size="lg"
      secondaryBtnText="Close"
      onSecondaryClick={onClose}
    >
      <div className="flex flex-col h-[calc(100vh-140px)] relative">
        {/* Actions Bar */}
        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <div className="absolute top-2 right-4 z-10">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleResolve}
              disabled={isResolving}
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 bg-white/90 backdrop-blur"
            >
              Mark as Resolved
            </Button>
          </div>
        )}
        
        <UnifiedTicketChat ticket={ticket} isAgent={false} />
      </div>
    </Slideover>
  );
}
