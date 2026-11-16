// Generated TRYST SDK over /api/v1 (tables, Tryst cards, combos, ideas, earn rules).
import apiClient from '@/api/client';
import type { BulkUploadResult } from '@/types/bulkUpload';

export interface SlotView { slotId: number; startsAt: string; left: number; fits: boolean }
export interface BookingView { bookingId: number; orderId: number; shareCode: string; startsAt: string; partySize: number; seating: string; occasion?: string | null }
export interface CardView { hostFirstName: string; startsAt: string; partySize: number; occasion?: string | null; past: boolean; coming: string[] }
export interface ComboView { id: number; productId: number; slug: string; name: string; price: number; label: string; days: string; availableFrom: string; availableTo: string; audience?: string | null; availableNow: boolean }
export interface EarnRule { eventType: string; label: string; coins: number; perDayCap?: number | null; onceOnly: boolean }
export type IdeaStatus = 'NEW' | 'PLANNED' | 'DONE';
export interface Idea { id: number; title: string; body: string; category: string; status: IdeaStatus; publicNote?: string | null; showPublic: boolean; createdAt: string; updatedAt: string }
export interface PublicIdea { id: number; title: string; category: string; status: IdeaStatus; publicNote?: string | null }

const multipart = (file: File) => { const f = new FormData(); f.append('file', file); return f; };
const mp = { headers: { 'Content-Type': 'multipart/form-data' } };

export const trystService = {
  availability: async (date: string, party: number) => (await apiClient.get<SlotView[]>('/api/v1/tables/availability', { params: { date, party } })).data,
  book: async (req: { slotId: number; partySize: number; seating: string; occasion?: string; note?: string }) => (await apiClient.post<BookingView>('/api/v1/tables/book', req)).data,
  myBookings: async () => (await apiClient.get<BookingView[]>('/api/v1/tables/bookings/mine')).data,
  card: async (code: string) => (await apiClient.get<CardView>(`/api/v1/t/${code}`)).data,
  rsvp: async (code: string, firstName: string) => (await apiClient.post<CardView>(`/api/v1/t/${code}/rsvp`, { firstName })).data,
  combos: async () => (await apiClient.get<ComboView[]>('/api/v1/combos/now')).data,
  earnRules: async () => (await apiClient.get<EarnRule[]>('/api/v1/public/earn-rules')).data,
  suggest: async (req: { title: string; body: string; category: string }) => (await apiClient.post<Idea>('/api/v1/suggestions', req)).data,
  myIdeas: async () => (await apiClient.get<Idea[]>('/api/v1/suggestions/mine')).data,
  publicIdeas: async () => (await apiClient.get<PublicIdea[]>('/api/v1/suggestions/public')).data,
  // admin
  adminIdeas: async () => (await apiClient.get<Idea[]>('/api/v1/admin/suggestions')).data,
  updateIdea: async (id: number, req: { status?: IdeaStatus; publicNote?: string; showPublic?: boolean }) => (await apiClient.put<Idea>(`/api/v1/admin/suggestions/${id}`, req)).data,
  bulkIdeas: async (file: File) => (await apiClient.post<BulkUploadResult>('/api/v1/admin/suggestions/bulk-upload', multipart(file), mp)).data,
  adminCombos: async () => (await apiClient.get<ComboView[]>('/api/v1/admin/combo-windows')).data,
  updateCombo: async (id: number, req: { label: string; days: string; availableFrom: string; availableTo: string; audience?: string }) => (await apiClient.put<ComboView>(`/api/v1/admin/combo-windows/${id}`, { productId: null, ...req })).data,
  bulkCombos: async (file: File) => (await apiClient.post<BulkUploadResult>('/api/v1/admin/combo-windows/bulk-upload', multipart(file), mp)).data,
};
