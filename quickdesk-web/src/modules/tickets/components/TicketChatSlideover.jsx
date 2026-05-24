import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Slideover from '../../core/components/ui/Slideover';
import Button from '../../core/components/ui/Button';
import { useAuth } from '../../core/hooks/useAuth';
import { useReplyTicket } from '../tickets.hooks';
import { FormattedText } from './RichTextEditor';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function TicketChatSlideover({ isOpen, onClose, ticket }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  
  const { mutate: replyTicket, isPending } = useReplyTicket(ticket?.id);

  // Initialize messages from ticket.replies
  useEffect(() => {
    if (ticket?.replies) {
      setMessages(ticket.replies);
    } else if (ticket?.finalReply) {
      // Fallback for legacy tickets
      setMessages([{
        id: 'legacy-1',
        message: ticket.finalReply,
        user: ticket.resolvedBy || { name: 'Support Agent' },
        createdAt: ticket.resolvedAt || ticket.updatedAt
      }]);
    } else {
      setMessages([]);
    }
  }, [ticket]);

  // WebSocket connection
  useEffect(() => {
    if (!isOpen || !ticket?.id) return;

    const socket = io(API_BASE, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('joinTicket', ticket.id);
    });

    socket.on('ticket:reply', (newReply) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newReply.id)) return prev;
        return [...prev, newReply];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, ticket?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    replyTicket(inputText, {
      onSuccess: () => setInputText('')
    });
  };

  if (!ticket) return null;

  return (
    <Slideover
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Chat: ${ticket.title}`}
      size="md"
    >
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 rounded-lg border border-slate-200">
          
          {/* Initial Ticket Message */}
          <div className="flex flex-col items-start w-full">
            <span className="text-xs font-medium text-gray-500 mb-1 ml-2">{ticket.employee?.name || 'Employee'}</span>
            <div className="bg-white border border-slate-200 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm p-4 w-[85%]">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.user?.id === user?.id;
            
            return (
              <div key={msg.id || idx} className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                <span className={`text-xs font-medium text-gray-500 mb-1 ${isMe ? 'mr-2' : 'ml-2'}`}>
                  {isMe ? 'You' : msg.user?.name || 'Agent'}
                </span>
                
                <div className={`rounded-2xl shadow-sm p-4 max-w-[85%] ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-gray-800 rounded-tl-sm'
                }`}>
                  <div className={`prose prose-sm max-w-none ${isMe ? 'prose-invert' : ''}`}>
                    <FormattedText text={msg.message} />
                  </div>
                  <div className={`text-[10px] mt-2 ${isMe ? 'text-indigo-200' : 'text-gray-400'} text-right`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
          <div className="pt-4 border-t border-slate-200 mt-4 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 rounded-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm px-4 py-2"
            />
            <Button onClick={handleSend} disabled={isPending || !inputText.trim()} isLoading={isPending} className="rounded-full !px-5">
              Send
            </Button>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-200 mt-4 text-center text-sm text-gray-500 italic">
            This ticket is resolved. You cannot send further messages.
          </div>
        )}
      </div>
    </Slideover>
  );
}
