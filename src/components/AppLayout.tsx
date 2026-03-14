import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import { Menu, Search, Plus } from 'lucide-react';

interface AppLayoutProps {
  onAddMemory: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/all': 'All Media',
  '/videos': 'Videos',
  '/photos': 'Photos',
  '/poems': 'Poems',
  '/favorites': 'Favorites',
  '/settings': 'Settings',
};

const AppLayout: React.FC<AppLayoutProps> = ({ onAddMemory }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'MemoirHub';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center h-[62px] px-4 lg:px-9 gap-4"
          style={{
            background: 'rgba(8,8,14,0.88)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--bdr)',
          }}
        >
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ color: 'var(--txt2)' }}>
            <Menu size={20} />
          </button>

          <h2 className="font-display text-xl font-light tracking-[0.05em] shrink-0" style={{ color: 'var(--cream)' }}>
            {pageTitle}
          </h2>

          <div className="flex-1 flex justify-center max-w-[440px] mx-auto">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-text)' }} />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg pl-9 pr-3 py-2 font-body text-[13px] outline-none transition-all"
                style={{
                  background: 'var(--sur)',
                  border: '1px solid var(--bdr2)',
                  color: 'var(--txt)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(200,164,74,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--bdr2)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <button
            onClick={onAddMemory}
            className="shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2 font-body text-[13px] font-medium transition-all hover:-translate-y-px hover:shadow-glow-gold"
            style={{ background: 'var(--gold)', color: '#120e00' }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Memory</span>
          </button>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-9 animate-fadeUp">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

export function useSearchQuery() {
  const { searchQuery } = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
    ? { searchQuery: '' }
    : { searchQuery: '' };
  return searchQuery;
}
