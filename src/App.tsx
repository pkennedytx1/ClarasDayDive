import { Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { LegalPage } from '@/pages/LegalPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<LegalPage />} />
      <Route path="/terms" element={<LegalPage />} />
      <Route path="/accessibility" element={<LegalPage />} />
      <Route path="/cookies" element={<LegalPage />} />
      <Route path="*" element={<LegalPage />} />
    </Routes>
  );
}
