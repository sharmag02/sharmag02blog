import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { Header } from './components/layout/Header';
import { BlogList } from './components/blog/BlogList';
import { BlogDetail } from './components/blog/BlogDetail';
import { AdminPanel } from './components/admin/AdminPanel';

function App() {
  const { user, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggleMode={() => setAuthMode('signup')} />
    ) : (
      <Signup onToggleMode={() => setAuthMode('login')} />
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Header currentView={currentView} onNavigate={setCurrentView} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'admin' && profile?.is_admin ? (
            <AdminPanel />
          ) : (
            <Routes>
              {/* Home / Blog list */}
              <Route path="/" element={<BlogList />} />

              {/* Blog detail by slug */}
              <Route path="/blogs/:slug" element={<BlogDetail />} />

              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
