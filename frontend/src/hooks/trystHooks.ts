import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trystService, type IdeaStatus } from '@/services/trystService';
import { withToast } from '@/lib/apiToast';

export const useAvailability = (date: string, party: number) =>
  useQuery({ queryKey: ['tryst-avail', date, party], queryFn: () => trystService.availability(date, party), refetchInterval: 30000 });
export const useCard = (code: string) => useQuery({ queryKey: ['tryst-card', code], queryFn: () => trystService.card(code), retry: false });
export const useCombos = () => useQuery({ queryKey: ['tryst-combos'], queryFn: trystService.combos });
export const useEarnRules = () => useQuery({ queryKey: ['tryst-earn'], queryFn: trystService.earnRules });
export const usePublicIdeas = () => useQuery({ queryKey: ['tryst-public-ideas'], queryFn: trystService.publicIdeas });
export const useMyIdeas = (enabled: boolean) => useQuery({ queryKey: ['tryst-my-ideas'], queryFn: trystService.myIdeas, enabled });
export const useMyBookings = (enabled: boolean) => useQuery({ queryKey: ['tryst-my-bookings'], queryFn: trystService.myBookings, enabled });

export function useRsvp(code: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => withToast(trystService.rsvp(code, name), 'You are on the list'),
    onSuccess: (card) => qc.setQueryData(['tryst-card', code], card),
  });
}

export function useBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: Parameters<typeof trystService.book>[0]) => trystService.book(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tryst-avail'] });
      qc.invalidateQueries({ queryKey: ['tryst-my-bookings'] });
      qc.invalidateQueries({ queryKey: ['orders', 'mine'] });
    },
  });
}

export function useSuggest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: Parameters<typeof trystService.suggest>[0]) => trystService.suggest(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tryst-my-ideas'] }),
  });
}

export const useAdminIdeas = () => useQuery({ queryKey: ['tryst-admin-ideas'], queryFn: trystService.adminIdeas });
export function useUpdateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: { id: number; status?: IdeaStatus; publicNote?: string; showPublic?: boolean }) => {
      const { id, ...rest } = a;
      return withToast(trystService.updateIdea(id, rest), 'Idea updated');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tryst-admin-ideas'] }); qc.invalidateQueries({ queryKey: ['tryst-public-ideas'] }); },
  });
}
export const useAdminCombos = () => useQuery({ queryKey: ['tryst-admin-combos'], queryFn: trystService.adminCombos });
export function useUpdateCombo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: { id: number; label: string; days: string; availableFrom: string; availableTo: string; audience?: string }) => {
      const { id, ...rest } = a;
      return withToast(trystService.updateCombo(id, rest), 'Combo window updated');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tryst-admin-combos'] }); qc.invalidateQueries({ queryKey: ['tryst-combos'] }); },
  });
}
