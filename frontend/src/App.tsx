import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AnalyzerPage from './pages/AnalyzerPage';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import ApiKeysPage from './pages/ApiKeysPage';
import DashboardPage from './pages/DashboardPage';
import DeveloperDocsPage from './pages/DeveloperDocsPage';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { BulkAnalyzerPage } from './pages/BulkAnalyzerPage';
import { GoogleOAuthProvider } from './components/GoogleOAuthProvider';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="app-shell">
      <Navbar />
      <main className={isDashboard ? 'dashboard-body' : 'page-body'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<OverviewDashboard />} />
          <Route path="/settings" element={<DashboardPage />} />
          <Route path="/apikeys" element={<ApiKeysPage />} />
          <Route path="/analyze" element={<AnalyzerPage />} />
          <Route path="/bulk" element={<BulkAnalyzerPage />} />
          <Route path="/docs" element={<DeveloperDocsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
