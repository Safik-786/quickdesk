import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from './tickets.api';
import { queryKeys } from '../../lib/queryKeys';

// ── Queries ───────────────────────────────────────────────────────────────────

export function useMyTickets(filters = {}) {
  return useQuery({
    queryKey: [...queryKeys.tickets.mine(), filters],
    queryFn: () => ticketsApi.getMyTickets(filters),
  });
}

export function useAllTickets(filters = {}) {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters),
    queryFn: () => ticketsApi.getAll(filters),
  });
}

export function useTicket(id) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => ticketsApi.getOne(id),
    enabled: !!id,
  });
}

export function useTicketDraft(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.tickets.draft(id),
    queryFn: () => ticketsApi.getDraft(id),
    enabled: !!id && (options.enabled ?? false), // manual trigger
    staleTime: Infinity, // draft doesn't auto-refresh
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useSubmitTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ticketsApi.submit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tickets.mine() });
    },
  });
}

export function useOverrideTicket(ticketId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => ticketsApi.override(ticketId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
      qc.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
    },
  });
}

export function useReplyTicket(ticketId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reply) => ticketsApi.reply(ticketId, reply),
    onSuccess: (updatedTicket) => {
      // Update the detail cache directly
      qc.setQueryData(queryKeys.tickets.detail(ticketId), updatedTicket);
      qc.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
    },
  });
}
