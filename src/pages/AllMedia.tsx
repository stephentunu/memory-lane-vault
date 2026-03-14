import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaItems, getFavorites, toggleFavorite, deleteMediaItem, deleteFile, logActivity } from '@/lib/api';
import type { MediaItem } from '@/lib/api';
import MediaCard from '@/components/MediaCard';
import PoemCard from '@/components/PoemCard';
import DetailModal from '@/components/DetailModal';
import { useOutletContext } from 'react-router-dom';
import { LayoutGrid, List } from 'lucide-react';

interface AllMediaProps {
  typeFilter?: 'video' | 'photo' | 'poem';
  favoritesOnly?: boolean;
}

const AllMedia: React.FC<AllMediaProps> = ({ typeFilter, favoritesOnly }) => {
  const { user } = useAuth();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<string>(typeFilter || 'all');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    let data: MediaItem[];
    if (favoritesOnly) {
      data = await getFavorites(user.id);
    } else if (typeFilter) {
      data = await getMediaItems(user.id, typeFilter);
    } else {
      data = await getMediaItems(user.id);
    }
    setItems(data);
  };

  useEffect(() => { load(); }, [user, typeFilter, favoritesOnly]);

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

  let filtered = items;
  if (!typeFilter && !favoritesOnly) {
    if (filter === 'favorites') filtered = filtered.filter((i) => i.is_favorite);
    else if (filter !== 'all') filtered = filtered.filter((i) => i.type === filter);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((i) =>
      i.title.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.content?.toLowerCase().includes(q) ||
      i.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (sort === 'newest') filtered.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
  else if (sort === 'oldest') filtered.sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());
  else if (sort === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));

  const filterChips = typeFilter || favoritesOnly ? [] : [
    { key: 'all', label: 'All' },
    { key: 'video', label: '▶ Videos' },
    { key: 'photo', label: '◈ Photos' },
    { key: 'poem', label: '❧ Poems' },
    { key: 'favorites', label: '♥ Favorites' },
  ];

  const title = favoritesOnly ? 'Favorites' : typeFilter ? `${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}s` : 'All Media';
  const subtitle = `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-[22px] font-normal" style={{ color: 'var(--cream)' }}>{title}</h2>
          <p className="font-mono-label text-[11px] tracking-[0.04em] mt-0.5" style={{ color: 'var(--muted-text)' }}>{subtitle}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className="px-3 py-1 rounded-full font-body text-xs transition-all"
            style={{
              border: filter === chip.key ? '1px solid var(--gold)' : '1px solid var(--bdr2)',
              background: filter === chip.key ? 'var(--gold-dim)' : 'var(--sur)',
              color: filter === chip.key ? 'var(--gold)' : 'var(--txt2)',
            }}
          >
            {chip.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={sort} onChange={(e) => setSort(e.target.value)}
            className="rounded-full px-3 py-1 font-body text-xs outline-none appearance-none cursor-pointer"
            style={{ background: 'var(--sur)', border: '1px solid var(--bdr2)', color: 'var(--txt2)' }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A-Z</option>
          </select>

          <div className="flex rounded-full overflow-hidden" style={{ border: '1px solid var(--bdr2)', background: 'var(--sur)' }}>
            <button onClick={() => setViewMode('grid')} className="px-2 py-1 transition-all"
              style={{ background: viewMode === 'grid' ? 'var(--sur2)' : 'transparent', color: viewMode === 'grid' ? 'var(--gold)' : 'var(--muted-text)' }}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setViewMode('list')} className="px-2 py-1 transition-all"
              style={{ background: viewMode === 'list' ? 'var(--sur2)' : 'transparent', color: viewMode === 'list' ? 'var(--gold)' : 'var(--muted-text)' }}>
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl opacity-35 mb-4">✦</div>
          <h4 className="font-display text-[22px] font-light" style={{ color: 'var(--txt2)' }}>No memories found</h4>
          <p className="font-body text-[13px] mt-2 mb-5" style={{ color: 'var(--muted-text)' }}>Try adjusting your filters or add a new memory</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-3.5' : 'flex flex-col gap-3'} style={viewMode === 'grid' ? { gridTemplateColumns: `repeat(auto-fill, minmax(${typeFilter === 'poem' ? '290px' : '210px'}, 1fr))` } : undefined}>
          {filtered.map((item) =>
            item.type === 'poem' ? (
              <PoemCard key={item.id} item={item} onClick={() => { setSelectedItem(item); setDetailOpen(true); }} onToggleFav={() => handleFav(item)} onDelete={() => handleDelete(item)} />
            ) : (
              <MediaCard key={item.id} item={item} onClick={() => { setSelectedItem(item); setDetailOpen(true); }} onToggleFav={() => handleFav(item)} onDelete={() => handleDelete(item)} />
            )
          )}
        </div>
      )}

      <DetailModal item={selectedItem} open={detailOpen} onClose={() => setDetailOpen(false)} onUpdated={load} onEdit={() => {}} />
    </div>
  );
};

export default AllMedia;
