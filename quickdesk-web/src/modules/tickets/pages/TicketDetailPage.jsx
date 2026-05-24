
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket, useTicketDraft, useReplyTicket, useOverrideTicket } from '../tickets.hooks';
import AuditLogTable from '../components/AuditLogTable';
import AIDraftEditor from '../components/AIDraftEditor';
import Button from '../../core/components/ui/Button';
import Dropdown from '../../core/components/ui/Dropdown';
import RichTextEditor, { FormattedText } from '../components/RichTextEditor';
import { parseMarkdownToHtml } from '../utils/markdown';
import toast from 'react-hot-toast';
import UnifiedTicketChat from '../components/UnifiedTicketChat';
// import { useAuth } from '../../core/hooks/useAuth';
import { useAuth } from '../../../context/AuthContext';


const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const CATEGORY_OPTIONS = [
  { value: 'IT', label: 'IT' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const backIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const { data: ticket, isLoading, error } = useTicket(id);
  const { mutate: overrideTicket, isPending: isOverriding } = useOverrideTicket(id);
  
  const { user } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;
  if (error) return <div className="p-8 text-red-600 text-center">Error loading ticket: {error.message}</div>;
  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-white rounded-xl shadow">
      <main className="max-w-7xl mx-auto sm:p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          iconLeft={backIcon}
          className="mb-6 uppercase !px-0 text-blue-800 hover:text-blue-800 hover:bg-transparent"
        >
          Back to list
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          <div className="lg:col-span-2 h-full">
            <UnifiedTicketChat ticket={ticket} isAgent={true} />
          </div>

          <div className="space-y-6">
            {/* Actions Sidebar */}
            <div className="bg-white rounded-xl  border border-slate-200 p-4">
              <h3 className="text-lg font-bold bg-gradient-to-br from-cyan-600 via-blue-700 to-blue-900 text-transparent bg-clip-text mb-4">Ticket Actions</h3>

              <Dropdown
                label="Change Status"
                value={ticket.status}
                onChange={(status) => overrideTicket({ status })}
                options={STATUS_OPTIONS}
                disabled={isOverriding}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Dropdown
                  label={
                    <span className="flex justify-between items-center w-full">
                      <span>Category</span>
                      {!ticket.agentCategory && ticket.aiCategory && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">AI</span>
                      )}
                    </span>
                  }
                  value={ticket.agentCategory || ticket.aiCategory || 'Other'}
                  onChange={(category) => overrideTicket({ category })}
                  options={CATEGORY_OPTIONS}
                  disabled={isOverriding}
                />
                <Dropdown
                  label={
                    <span className="flex justify-between items-center w-full">
                      <span>Priority</span>
                      {!ticket.agentPriority && ticket.aiPriority && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">AI</span>
                      )}
                    </span>
                  }
                  value={ticket.agentPriority || ticket.aiPriority || 'Low'}
                  onChange={(priority) => overrideTicket({ priority })}
                  options={PRIORITY_OPTIONS}
                  disabled={isOverriding}
                />
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white rounded-xl  border border-slate-200 p-2">
              <h3 className="text-lg font-bold bg-gradient-to-br from-cyan-600 via-blue-700 to-blue-900 text-transparent bg-clip-text mb-4">Audit Log</h3>
              <AuditLogTable logs={ticket.auditLogs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
