import React, { useState } from 'react';
import { MediaItem } from '@/lib/api';
import { Heart, Trash2 } from 'lucide-react';

interface PoemCardProps {
  item: MediaItem;
  onClick: () => void;
  onToggleFav: () => void;
  onDelete: () => void;
}

const PoemCard: React.FC<PoemCardProps> = ({ item, onClick, onToggleFav, onDelete }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative rounded-vault p-[22px] cursor-pointer transition-all duration-200 overflow-hidden"
      style={{
        background: 'var(--sur)',
        border: hover ? '1px solid rgba(232,80,106,0.35)' : '1px solid var(--bdr)',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? '0 8px 30px rgba(232,80,106,0.06)' : 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {/* Decorative quote */}
      <span className="absolute top-2 right-4 font-display text-[90px] leading-none select-none pointer-events-none" style={{ opacity: 0.07, color: 'var(--cream)' }}>"</span>

      <h3 className="font-display text-[19px] italic" style={{ color: 'var(--cream)' }}>{item.title}</h3>

      <p
        className="font-display text-sm italic mt-3 whitespace-pre-wrap"
        style={{ color: 'var(--txt2)', lineHeight: 1.85, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {item.content}
      </p>

      <div className="flex items-center justify-between mt-4">
        <span className="font-mono-label text-[10px]" style={{ color: 'var(--muted-text)' }}>
          {item.date ? new Date(item.date).toLocaleDateString() : new Date(item.created_at!).toLocaleDateString()}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: item.is_favorite ? 'var(--gold)' : 'var(--muted-text)' }}
          >
            <Heart size={14} fill={item.is_favorite ? 'var(--gold)' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-text)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.map((tag) => (
            <span key={tag} className="font-mono-label text-[9px] px-[7px] py-0.5 rounded-full" style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', color: 'var(--muted-text)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoemCard;
