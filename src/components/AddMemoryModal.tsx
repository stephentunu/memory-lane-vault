import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createMediaItem, uploadFile, logActivity } from '@/lib/api';
import { X } from 'lucide-react';

interface AddMemoryModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editItem?: any;
}

const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ open, onClose, onSaved, editItem }) => {
  const { user } = useAuth();
  const [type, setType] = useState<'video' | 'photo' | 'poem'>('photo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setTitle(editItem.title);
      setDescription(editItem.description || '');
      setContent(editItem.content || '');
      setTags(editItem.tags?.join(', ') || '');
      setDate(editItem.date || '');
    } else {
      resetForm();
    }
  }, [editItem, open]);

  const resetForm = () => {
    setType('photo');
    setTitle('');
    setDescription('');
    setContent('');
    setTags('');
    setDate('');
    setFile(null);
    setFilePreview(null);
    setUploadProgress(0);
  };

  const handleFile = (f: File) => {
    setFile(f);
    setUploadProgress(0);
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    reader.onload = () => {
      setFilePreview(reader.result as string);
      setUploadProgress(100);
    };
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!user || !title.trim()) return;
    setUploading(true);
    try {
      let filePath: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let fileMimeType: string | undefined;

      if (file) {
        const bucket = type === 'video' ? 'videos' : type === 'photo' ? 'photos' : 'poems';
        const itemId = crypto.randomUUID();
        const path = `${user.id}/${itemId}/${file.name}`;
        await uploadFile(bucket, path, file);
        filePath = path;
        fileName = file.name;
        fileSize = file.size;
        fileMimeType = file.type;
      }

      await createMediaItem({
        user_id: user.id,
        type,
        title: title.trim(),
        description: description.trim() || null,
        content: null,
        file_path: filePath || null,
        file_name: fileName || null,
        file_size: fileSize || null,
        file_mime_type: fileMimeType || null,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        date: date || null,
      });

      await logActivity(user.id, 'Added', title.trim(), type);
      onSaved();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error(err);
    }
    setUploading(false);
  };

  if (!open) return null;

  const typeOptions = [
    { key: 'video' as const, icon: '🎬', label: 'Video', borderColor: '#9d7fff', bgColor: 'rgba(108,63,255,0.15)' },
    { key: 'photo' as const, icon: '🖼️', label: 'Photo', borderColor: '#5dd6e8', bgColor: 'rgba(0,184,204,0.14)' },
    { key: 'poem' as const, icon: '✒️', label: 'Poem', borderColor: '#ff8fa3', bgColor: 'rgba(232,80,106,0.14)' },
  ];

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-[620px] max-h-[92vh] overflow-y-auto rounded-vault animate-slideUp"
        style={{ background: 'var(--bg2)', border: '1px solid var(--bdr2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-4" style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bdr)' }}>
          <h2 className="font-display text-[22px] font-light" style={{ color: 'var(--cream)' }}>
            {editItem ? 'Edit Memory' : 'Add Memory'}
          </h2>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-full flex items-center justify-center" style={{ color: 'var(--txt2)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setType(opt.key)}
                className="rounded-lg py-3 px-2.5 text-center transition-all"
                style={{
                  border: type === opt.key ? `1px solid ${opt.borderColor}` : '1px solid var(--bdr2)',
                  background: type === opt.key ? opt.bgColor : 'transparent',
                }}
              >
                <div className="text-[22px] mb-1">{opt.icon}</div>
                <div className="font-body text-[11px] font-medium" style={{ color: type === opt.key ? 'var(--txt)' : 'var(--txt2)' }}>{opt.label}</div>
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="font-mono-label text-[10px] tracking-[0.12em] uppercase block mb-2" style={{ color: 'var(--muted-text)' }}>Title</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 font-body text-[13.5px] outline-none transition-all"
              style={{ background: 'var(--sur)', border: '1px solid var(--bdr2)', color: 'var(--txt)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--bdr2)'; }}
              placeholder="Give your memory a title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono-label text-[10px] tracking-[0.12em] uppercase block mb-2" style={{ color: 'var(--muted-text)' }}>Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full rounded-lg px-3 py-2.5 font-body text-[13.5px] outline-none transition-all resize-vertical"
              style={{ background: 'var(--sur)', border: '1px solid var(--bdr2)', color: 'var(--txt)', lineHeight: 1.7 }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--bdr2)'; }}
              placeholder="Optional description"
            />
          </div>

          {/* File upload (all types) */}
          <div>
            <label className="font-mono-label text-[10px] tracking-[0.12em] uppercase block mb-2" style={{ color: 'var(--muted-text)' }}>File</label>
            {!filePreview && !file ? (
              <div
                className="relative rounded-lg p-9 text-center transition-all cursor-pointer"
                style={{
                  border: dragOver ? '2px dashed var(--gold)' : '2px dashed var(--bdr2)',
                  background: dragOver ? 'var(--gold-dim)' : 'var(--sur)',
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" className="hidden"
                  accept={type === 'video' ? 'video/*' : type === 'photo' ? 'image/*' : '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
                <div className="text-3xl mb-2">☁</div>
                <p className="font-body text-sm" style={{ color: 'var(--txt2)' }}>
                  Click to <span style={{ color: 'var(--gold)' }}>upload</span> or drag & drop
                </p>
                <p className="font-mono-label text-[10px] mt-2" style={{ color: 'var(--muted-text)' }}>
                  {type === 'video' ? 'MP4 · MOV · AVI · MKV · WEBM' : type === 'photo' ? 'JPG · PNG · GIF · WEBP · AVIF · SVG' : 'PDF · DOC · DOCX'}
                </p>
              </div>
            ) : (
              <div>
                {uploadProgress < 100 && (
                  <div className="rounded-lg p-3.5" style={{ background: 'var(--sur2)' }}>
                    <p className="font-body text-xs truncate" style={{ color: 'var(--txt2)' }}>{file?.name}</p>
                    <div className="h-[3px] rounded-full mt-2" style={{ background: 'var(--bg3)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, var(--gold), var(--gold2))' }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="font-mono-label text-[9px]" style={{ color: 'var(--muted-text)' }}>{uploadProgress}%</span>
                      <span className="font-mono-label text-[9px]" style={{ color: 'var(--muted-text)' }}>{file ? formatSize(file.size) : ''}</span>
                    </div>
                  </div>
                )}
                {uploadProgress >= 100 && (
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--bdr2)', background: 'var(--bg3)' }}>
                    {type === 'video' ? (
                      <video src={filePreview!} controls className="w-full max-h-[190px]" style={{ background: '#000' }} />
                    ) : type === 'photo' ? (
                      <img src={filePreview!} alt="preview" className="w-full max-h-[190px] object-cover" />
                    ) : (
                      <div className="flex items-center justify-center p-6" style={{ background: 'var(--bg3)' }}>
                        <div className="text-center">
                          <div className="text-4xl mb-2">📄</div>
                          <p className="font-body text-xs" style={{ color: 'var(--txt2)' }}>{file?.name}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center px-3 py-2 gap-2">
                      <span className="flex-1 truncate font-body text-xs" style={{ color: 'var(--txt2)' }}>{file?.name}</span>
                      <span className="font-mono-label text-[10px] shrink-0" style={{ color: 'var(--muted-text)' }}>{file ? formatSize(file.size) : ''}</span>
                      <button onClick={() => { setFile(null); setFilePreview(null); setUploadProgress(0); }} className="ml-1 text-sm transition-colors hover:opacity-80" style={{ color: 'var(--error)' }}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono-label text-[10px] tracking-[0.12em] uppercase block mb-2" style={{ color: 'var(--muted-text)' }}>Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 font-body text-[13.5px] outline-none transition-all"
                style={{ background: 'var(--sur)', border: '1px solid var(--bdr2)', color: 'var(--txt)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--bdr2)'; }}
                placeholder="nature, sunset, love"
              />
            </div>
            <div>
              <label className="font-mono-label text-[10px] tracking-[0.12em] uppercase block mb-2" style={{ color: 'var(--muted-text)' }}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 font-body text-[13.5px] outline-none transition-all"
                style={{ background: 'var(--sur)', border: '1px solid var(--bdr2)', color: 'var(--txt)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--bdr2)'; }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg px-4 py-2 font-body text-[13px] transition-all"
              style={{ color: 'var(--txt)', border: '1px solid var(--bdr2)', background: 'transparent' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={uploading || !title.trim()}
              className="rounded-lg px-4 py-2 font-body text-[13px] font-medium transition-all hover:-translate-y-px hover:shadow-glow-gold disabled:opacity-50"
              style={{ background: 'var(--gold)', color: '#120e00' }}>
              {uploading ? 'Saving...' : 'Save Memory ✦'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemoryModal;
