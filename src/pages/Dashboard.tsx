import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaItems, getMediaCounts, getActivityLog, getProfile, toggleFavorite, deleteMediaItem, deleteFile, logActivity } from '@/lib/api';
import type { MediaItem, ActivityLog, Profile } from '@/lib/api';
import MediaCard from '@/components/MediaCard';
import PoemCard from '@/components/PoemCard';
import DetailModal from '@/components/DetailModal';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [counts, setCounts] = useState({ videos: 0, photos: 0, poems: 0 });
  const [recent, setRecent] = useState<MediaItem[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const [p, c, r, a] = await Promise.all([
      getProfile(user.id),
      getMediaCounts(user.id),
      getMediaItems(user.id),
      getActivityLog(user.id),
    ]);
    setProfile(p);
    setCounts(c);
    setRecent(r.slice(0, 6));
    setActivity(a);
  };

  useEffect(() => { load(); }, [user]);

  const handleFav = async (item: MediaItem) => {
    await toggleFavorite(item.id, item.is_favorite ?? false);
    await logActivity(user!.id, item.is_favorite ? 'Unfavorited' : 'Favorited', item.title, item.type);
    load();
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm('Delete this memory?')) return;
    if (item.file_path) await deleteFile(item.type === 'video' ? 'videos' : 'photos', item.file_path);
    await deleteMediaItem(item.id);
    await logActivity(user!.id, 'Deleted', item.title, item.type);
    load();
  };

  const typeColors: Record<string, { primary: string; dim: string }> = {
    video: { primary: 'var(--video-primary)', dim: 'var(--video-dim)' },
    photo: { primary: 'var(--photo-primary)', dim: 'var(--photo-dim)' },
    poem: { primary: 'var(--poem-primary)', dim: 'var(--poem-dim)' },
  };

  const activityDotColor = (type: string | null) => {
    if (type === 'video') return 'var(--video-primary)';
    if (type === 'photo') return 'var(--photo-primary)';
    if (type === 'poem') return 'var(--poem-primary)';
    return 'var(--gold)';
  };

  const relativeTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const stats = [
    { type: 'video', icon: '🎬', count: counts.videos, label: 'Video memories' },
    { type: 'photo', icon: '🖼️', count: counts.photos, label: 'Photographs' },
    { type: 'poem', icon: '✒️', count: counts.poems, label: 'Written pieces' },
  ];

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div
        className="relative rounded-vault overflow-hidden px-8 py-10 lg:px-12 lg:py-11"
        style={{
          background: 'linear-gradient(140deg, #14101f 0%, #0d1420 55%, #120d1e 100%)',
          border: '1px solid var(--bdr2)',
        }}
      >
        <div className="absolute top-0 right-0 w-[360px] h-[360px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(200,164,74,0.1), transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[320px] h-[180px] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(108,63,255,0.08), transparent 70%)' }} />

        <div className="relative z-10">
          <p className="font-mono-label text-[9px] tracking-[0.32em] uppercase" style={{ color: 'var(--gold)' }}>
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
          </p>
          <h2 className="font-display text-3xl lg:text-[44px] font-light mt-3" style={{ color: 'var(--cream)' }}>
            Your Memories,<br />
            <span className="italic" style={{ color: 'var(--gold2)' }}>Your personal media sanctuary</span>
          </h2>
          <p className="font-body text-sm mt-4 max-w-[460px]" style={{ color: 'var(--txt2)', lineHeight: 1.75 }}>
            A place to store, organize, and relive your most treasured videos, photographs, and poems.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {stats.map((s) => (
          <div key={s.type} className="rounded-vault p-5 relative overflow-hidden" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${typeColors[s.type].primary}, transparent)` }} />
            <div className="flex items-start justify-between">
              <div className="w-[42px] h-[42px] rounded-lg flex items-center justify-center text-xl" style={{ background: typeColors[s.type].dim }}>
                {s.icon}
              </div>
              <span className="font-mono-label text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(200,164,74,0.1)', color: 'var(--gold)' }}>
                {s.type}
              </span>
            </div>
            <div className="mt-3">
              <span className="font-display text-[38px] font-light" style={{ color: 'var(--cream)' }}>{s.count}</span>
              <p className="font-body text-[11px] tracking-[0.04em]" style={{ color: 'var(--muted-text)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Recently added */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-[22px] font-normal" style={{ color: 'var(--cream)' }}>Recently Added</h3>
              <p className="font-mono-label text-[11px] tracking-[0.04em] mt-0.5" style={{ color: 'var(--muted-text)' }}>Your latest memories</p>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl opacity-35 mb-4">✦</div>
              <h4 className="font-display text-[22px] font-light" style={{ color: 'var(--txt2)' }}>No memories yet</h4>
              <p className="font-body text-[13px] mt-2" style={{ color: 'var(--muted-text)' }}>Start by adding your first memory</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {recent.map((item) =>
                item.type === 'poem' ? (
                  <PoemCard key={item.id} item={item} onClick={() => { setSelectedItem(item); setDetailOpen(true); }} onToggleFav={() => handleFav(item)} onDelete={() => handleDelete(item)} />
                ) : (
                  <MediaCard key={item.id} item={item} onClick={() => { setSelectedItem(item); setDetailOpen(true); }} onToggleFav={() => handleFav(item)} onDelete={() => handleDelete(item)} />
                )
              )}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="rounded-vault p-4" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
          <h4 className="font-display text-base font-normal mb-3" style={{ color: 'var(--cream)' }}>Activity</h4>
          {activity.length === 0 ? (
            <p className="font-body text-xs" style={{ color: 'var(--muted-text)' }}>No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className="w-[7px] h-[7px] rounded-full mt-1.5 shrink-0" style={{ background: activityDotColor(a.item_type) }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs truncate" style={{ color: 'var(--txt2)' }}>
                      <span style={{ color: 'var(--txt)' }}>{a.action}</span> — {a.item_title}
                    </p>
                    <span className="font-mono-label text-[9px]" style={{ color: 'var(--muted-text)' }}>{relativeTime(a.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DetailModal item={selectedItem} open={detailOpen} onClose={() => setDetailOpen(false)} onUpdated={load} onEdit={() => {}} />
    </div>
  );
};

export default Dashboard;
