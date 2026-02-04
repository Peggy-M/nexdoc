// App Router Configuration
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Overview } from '@/pages/dashboard/Overview';
import { Contracts } from '@/pages/dashboard/Contracts';
import { UploadPage } from '@/pages/dashboard/Upload';
import { Risks } from '@/pages/dashboard/Risks';
import { Team } from '@/pages/dashboard/Team';
import { Archive } from '@/pages/dashboard/Archive';
import { Settings } from '@/pages/dashboard/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('NexDoc_user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Register */}
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="risks" element={<Risks />} />
          <Route path="team" element={<Team />} />
          <Route path="archive" element={<Archive />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
