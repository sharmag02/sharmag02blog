import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, LogOut, LayoutDashboard, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentView: 'home' | 'admin';
  onNavigate: (view: 'home' | 'admin') => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-slate-900 hover:text-slate-700 transition"
            >
              <BookOpen className="w-8 h-8" />
              <span className="text-xl font-bold hidden sm:inline">BlogHub</span>
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                currentView === 'home'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>

            {profile?.is_admin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  currentView === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Admin</span>
              </button>
            )}

            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
              <span className="text-slate-700 font-medium">
                {profile?.full_name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-slate-600 hover:text-red-600 transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-slate-900 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition ${
                  currentView === 'home'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>

              {profile?.is_admin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition ${
                    currentView === 'admin'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Admin</span>
                </button>
              )}

              <div className="pt-4 border-t border-slate-200 mt-2">
                <div className="px-4 py-2 text-slate-700 font-medium">
                  {profile?.full_name || user?.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
