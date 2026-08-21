import { Route, Routes } from 'react-router-dom';
import { EventBookingProvider } from '@/context/EventBookingContext';
import { GeneralContactProvider } from '@/context/GeneralContactContext';
import { UnderConstructionGate } from '@/components/UnderConstructionGate';
import { HomePage } from '@/pages/HomePage';
import { LegalPage } from '@/pages/LegalPage';
import { HOME_ROUTE_PATHS } from '@/lib/sections';

export function App() {
  return (
    <UnderConstructionGate>
    <EventBookingProvider>
    <GeneralContactProvider>
    <Routes>
      {HOME_ROUTE_PATHS.map((path) => (
        <Route key={path} path={path} element={<HomePage />} />
      ))}
      <Route path="/privacy" element={<LegalPage />} />
      <Route path="/terms" element={<LegalPage />} />
      <Route path="/accessibility" element={<LegalPage />} />
      <Route path="/cookies" element={<LegalPage />} />
      <Route path="*" element={<LegalPage />} />
    </Routes>
    </GeneralContactProvider>
    </EventBookingProvider>
    </UnderConstructionGate>
  );
}
