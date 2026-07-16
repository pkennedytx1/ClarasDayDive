import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type EventBookingContextValue = {
  open: boolean;
  openBooking: () => void;
  closeBooking: () => void;
};

const EventBookingContext = createContext<EventBookingContextValue | null>(null);

export function EventBookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openBooking = useCallback(() => setOpen(true), []);
  const closeBooking = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openBooking, closeBooking }), [open, openBooking, closeBooking]);

  return <EventBookingContext.Provider value={value}>{children}</EventBookingContext.Provider>;
}

export function useEventBooking(): EventBookingContextValue {
  const ctx = useContext(EventBookingContext);
  if (!ctx) {
    throw new Error('useEventBooking must be used within EventBookingProvider');
  }
  return ctx;
}
