import React, { useState, useEffect } from 'react';
import { MediaItem, getSignedUrl } from '@/lib/api';
import { Heart, Trash2, Play } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  onToggleFav: () => void;
  onDelete: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick, onToggleFav, onDelete }) => {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (item.file_path) {
      const bucket = item.type === 'video' ? 'videos' : 'photos';
      getSignedUrl(bucket, item.file_path).then(setThumbUrl).catch(() => {});
    }
  }, [item.file_path, item.type]);

  const typeBadgeStyle: Record<string, React.CSSProperties> = {
    video: { background: 'rgba(108,63,255,0.75)' },
    photo: { background: 'rgba(0,184,204,0.75)' },
    poem: { background: 'rgba(232,80,106,0.75)' },
  };

  return (
    <div
      className="rounded-vault overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--sur)',
        border: hover ? '1px solid var(--bdr2)' : '1px solid var(--bdr)',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? '0 14px 44px rgba(0,0,0,0.55)' : 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/10', background: 'var(--bg3)' }}>
        {thumbUrl ? (
          item.type === 'video' ? (
            <>
              <video src={thumbUrl} preload="metadata" muted playsInline className="w-full h-full object-cover transition-transform duration-400" style={{ transform: hover ? 'scale(1.04)' : 'scale(1)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', transform: hover ? 'scale(1.08)' : 'scale(1)' }}>
                  <Play size={18} fill="white" color="white" />
                </div>
              </div>
            </>
          ) : (
            <img src={thumbUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-400" style={{ transform: hover ? 'scale(1.04)' : 'scale(1)' }} />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-45">
            <span className="text-3xl mb-1">{item.type === 'video' ? '🎬' : '🖼️'}</span>
            <span className="font-mono-label text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted-text)' }}>{item.type}</span>
          </div>
        )}

        {/* Type badge */}
        <span
          className="absolute top-2 left-2 font-mono-label text-[8px] uppercase px-2 py-0.5 rounded"
          style={{ ...typeBadgeStyle[item.type], color: 'white', backdropFilter: 'blur(8px)' }}
        >
          {item.type}
        </span>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-end justify-end p-2 gap-1.5 transition-opacity duration-200"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
            opacity: hover ? 1 : 0,
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <Heart size={14} color="white" fill={item.is_favorite ? 'var(--gold)' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <Trash2 size={14} color="white" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-[15px] py-[13px]">
        <h3 className="font-body text-[13.5px] font-medium truncate" style={{ color: 'var(--txt)' }}>{item.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono-label text-[10px]" style={{ color: 'var(--muted-text)' }}>
            {item.date ? new Date(item.date).toLocaleDateString() : new Date(item.created_at!).toLocaleDateString()}
          </span>
          {item.is_favorite && <Heart size={10} fill="var(--gold)" color="var(--gold)" />}
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map((tag) => (
              <span key={tag} className="font-mono-label text-[9px] px-[7px] py-0.5 rounded-full" style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', color: 'var(--muted-text)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaCard;
