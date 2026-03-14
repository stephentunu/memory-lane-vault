import React, { useState, useEffect } from 'react';
import { MediaItem, getSignedUrl, toggleFavorite, deleteMediaItem, deleteFile, logActivity } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { X, Heart, Trash2, Edit } from 'lucide-react';

interface DetailModalProps {
  item: MediaItem | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onEdit: (item: MediaItem) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, open, onClose, onUpdated, onEdit }) => {
  const { user } = useAuth();
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (item?.file_path) {
      const bucket = item.type === 'video' ? 'videos' : 'photos';
      getSignedUrl(bucket, item.file_path).then(setMediaUrl).catch(() => setMediaUrl(null));
    } else {
      setMediaUrl(null);
    }
  }, [item]);

  if (!open || !item) return null;

  const handleFav = async () => {
    await toggleFavorite(item.id, item.is_favorite ?? false);
    await logActivity(user!.id, item.is_favorite ? 'Unfavorited' : 'Favorited', item.title, item.type);
    onUpdated();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this memory permanently?')) return;
    setDeleting(true);
    try {
      if (item.file_path) {
        const bucket = item.type === 'video' ? 'videos' : 'photos';
        await deleteFile(bucket, item.file_path);
      }
      await deleteMediaItem(item.id);
      await logActivity(user!.id, 'Deleted', item.title, item.type);
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-[840px] max-h-[92vh] overflow-y-auto rounded-vault animate-slideUp"
        style={{ background: 'var(--bg2)', border: '1px solid var(--bdr2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Media display */}
          {item.type === 'video' && mediaUrl && (
            <video src={mediaUrl} controls className="w-full rounded-lg mb-5" style={{ background: '#000' }} />
          )}
          {item.type === 'photo' && mediaUrl && (
            <img src={mediaUrl} alt={item.title} className="w-full max-h-[420px] object-contain rounded-lg mb-5" style={{ background: 'var(--bg3)' }} />
          )}
          {item.type === 'poem' && item.content && (
            <div className="rounded-lg p-5 mb-5 whitespace-pre-wrap" style={{ background: 'var(--bg3)', borderLeft: '3px solid var(--poem-primary)' }}>
              <p className="font-display text-[17px] italic" style={{ color: 'var(--cream)', lineHeight: 2.1 }}>{item.content}</p>
            </div>
          )}

          {/* Metadata */}
          <h2 className="font-display text-[26px] font-normal" style={{ color: 'var(--cream)' }}>{item.title}</h2>

          <div className="flex flex-wrap gap-3 mt-3">
            <span className="font-mono-label text-[10px] uppercase px-2 py-0.5 rounded" style={{
              background: item.type === 'video' ? 'var(--video-dim)' : item.type === 'photo' ? 'var(--photo-dim)' : 'var(--poem-dim)',
              color: item.type === 'video' ? 'var(--video-light)' : item.type === 'photo' ? 'var(--photo-light)' : 'var(--poem-light)',
            }}>{item.type}</span>
            {item.date && <span className="font-mono-label text-[10px]" style={{ color: 'var(--muted-text)' }}>{new Date(item.date).toLocaleDateString()}</span>}
            {item.file_name && <span className="font-mono-label text-[10px]" style={{ color: 'var(--muted-text)' }}>{item.file_name}</span>}
            {item.file_size && <span className="font-mono-label text-[10px]" style={{ color: 'var(--muted-text)' }}>{formatSize(item.file_size)}</span>}
          </div>

          {item.description && (
            <p className="font-body text-[13.5px] mt-4" style={{ color: 'var(--txt2)', lineHeight: 1.75 }}>{item.description}</p>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {item.tags.map((tag) => (
                <span key={tag} className="font-mono-label text-[9px] px-[7px] py-0.5 rounded-full" style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', color: 'var(--muted-text)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-6 pt-4" style={{ borderTop: '1px solid var(--bdr)' }}>
            <button onClick={handleFav} className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-body text-xs transition-all"
              style={{ border: '1px solid var(--bdr2)', color: item.is_favorite ? 'var(--gold)' : 'var(--txt)' }}>
              <Heart size={14} fill={item.is_favorite ? 'var(--gold)' : 'none'} /> {item.is_favorite ? 'Favorited' : 'Favorite'}
            </button>
            <button onClick={() => onEdit(item)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-body text-xs transition-all"
              style={{ border: '1px solid var(--bdr2)', color: 'var(--txt)' }}>
              <Edit size={14} /> Edit
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-body text-xs transition-all"
              style={{ border: '1px solid var(--error)', color: 'var(--error)' }}>
              <Trash2 size={14} /> Delete
            </button>
            <div className="flex-1" />
            <button onClick={onClose} className="rounded-lg px-4 py-2 font-body text-[13px] font-medium transition-all hover:-translate-y-px hover:shadow-glow-gold"
              style={{ background: 'var(--gold)', color: '#120e00' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
