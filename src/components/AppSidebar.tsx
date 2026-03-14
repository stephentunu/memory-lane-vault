import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Grid3X3, Video, Image, PenLine, Heart, Settings, Menu, X, LogOut } from 'lucide-react';

const navSections = [
  {
    label: 'Navigation',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { title: 'All Media', path: '/all', icon: Grid3X3 },
    ],
  },
  {
    label: 'Collections',
    items: [
      { title: 'Videos', path: '/videos', icon: Video },
      { title: 'Photos', path: '/photos', icon: Image },
      { title: 'Poems', path: '/poems', icon: PenLine },
    ],
  },
  {
    label: 'Organize',
    items: [
      { title: 'Favorites', path: '/favorites', icon: Heart },
      { title: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ open, onClose }) => {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: 256,
          background: 'var(--bg2)',
          borderRight: '1px solid var(--bdr)',
        }}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-5" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-[26px] font-light tracking-[0.14em]" style={{ color: 'var(--gold2)' }}>
                MEMOIRHUB
              </h1>
              <p className="font-mono-label text-[8px] tracking-[0.32em] uppercase" style={{ color: 'var(--muted-text)' }}>
                PERSONAL MEDIA VAULT
              </p>
            </div>
            <button onClick={onClose} className="lg:hidden p-1" style={{ color: 'var(--txt2)' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="font-mono-label text-[9px] tracking-[0.2em] uppercase px-2.5 mb-2" style={{ color: 'var(--muted-text)' }}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-body transition-all"
                      style={{
                        color: isActive ? 'var(--gold2)' : 'var(--txt2)',
                        background: isActive ? 'var(--gold-dim)' : 'transparent',
                        border: isActive ? '1px solid rgba(200,164,74,0.22)' : '1px solid transparent',
                      }}
                    >
                      <item.icon size={16} />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--bdr)' }}>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] font-body transition-all"
            style={{ color: 'var(--txt2)' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
