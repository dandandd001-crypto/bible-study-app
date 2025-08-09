import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Library } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider.jsx';
import DarkModeToggle from './DarkModeToggle.jsx';
import GlobalSearch from './GlobalSearch.jsx';
import { Button } from '../UI/Button.jsx';
import TOC from '../Content/TOC.jsx';

export default function AppLayout() {
  const { signOut, role } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="h-[--header-height] border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-3">
            <Library className="text-indigo-600 dark:text-indigo-400" />
            <Link to="/" className="font-semibold tracking-tight">
              Bible Study
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-2">
            {role === 'admin' && (
              <Link to="/admin" title="Admin Dashboard">
                <Button variant={location.pathname.startsWith('/admin') ? 'primary' : 'outline'} size="sm">
                  <LayoutDashboard size={16} className="mr-1.5" />
                  Admin
                </Button>
              </Link>
            )}
            <DarkModeToggle />
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut size={16} className="mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 px-4 py-6">
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
          <div className="mb-3 md:hidden">
            <GlobalSearch />
          </div>
          <TOC />
        </aside>
        <section className="min-h-[60vh]">
          <Outlet />
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Bible Study
      </footer>
    </div>
  );
}
