import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { Header } from './components/layout/Header';
import { BlogList } from './components/blog/BlogList';
import { BlogDetail } from './components/blog/BlogDetail';
import { AdminPanel } from './components/admin/AdminPanel';

interface BlogWithAuthor {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

function App() {
  const { user, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');
  const [selectedBlog, setSelectedBlog] = useState<BlogWithAuthor | null>(null);

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
    <div className="min-h-screen bg-slate-50">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'admin' && profile?.is_admin ? (
          <AdminPanel />
        ) : selectedBlog ? (
          <BlogDetail blog={selectedBlog} onBack={() => setSelectedBlog(null)} />
        ) : (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Welcome to BlogHub by Gaurav Kumar
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Discover amazing stories and insights.
              </p>
            </div>
            <BlogList onSelectBlog={setSelectedBlog} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
