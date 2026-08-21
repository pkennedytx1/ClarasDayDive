import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type GeneralContactContextValue = {
  open: boolean;
  openContact: () => void;
  closeContact: () => void;
};

const GeneralContactContext = createContext<GeneralContactContextValue | null>(null);

export function GeneralContactProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openContact = useCallback(() => setOpen(true), []);
  const closeContact = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openContact, closeContact }), [open, openContact, closeContact]);

  return <GeneralContactContext.Provider value={value}>{children}</GeneralContactContext.Provider>;
}

export function useGeneralContact(): GeneralContactContextValue {
  const ctx = useContext(GeneralContactContext);
  if (!ctx) {
    throw new Error('useGeneralContact must be used within GeneralContactProvider');
  }
  return ctx;
}
