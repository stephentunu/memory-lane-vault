import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile } from '@/lib/api';
import type { Profile } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vaultName, setVaultName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showMeta, setShowMeta] = useState(true);
  const [hoverAnims, setHoverAnims] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      getProfile(user.id).then((p) => {
        setProfile(p);
        setVaultName(p.vault_name || '');
        setDisplayName(p.display_name || '');
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await updateProfile(user.id, { vault_name: vaultName, display_name: displayName });
    setSaving(false);
  };

  const handleExport = async () => {
    if (!user) return;
    const { data } = await supabase.from('media_items').select('*').eq('user_id', user.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'memoirhub-export.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (!user) return;
    if (!confirm('This will permanently delete ALL your memories. Are you sure?')) return;
    if (!confirm('This action CANNOT be undone. Continue?')) return;
    await supabase.from('media_items').delete().eq('user_id', user.id);
    await supabase.from('activity_log').delete().eq('user_id', user.id);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--sur)',
    border: '1px solid var(--bdr2)',
    color: 'var(--txt)',
  };

  return (
    <div className="max-w-[640px] space-y-6">
      {/* Profile */}
      <Section title="Profile">
        <div className="space-y-4">
          <Field label="Vault Name">
            <input type="text" value={vaultName} onChange={(e) => setVaultName(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 font-body text-[13.5px] outline-none" style={inputStyle} />
          </Field>
          <Field label="Your Name">
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 font-body text-[13.5px] outline-none" style={inputStyle} />
          </Field>
          <button onClick={handleSave} disabled={saving}
            className="rounded-lg px-4 py-2 font-body text-[13px] font-medium transition-all hover:-translate-y-px hover:shadow-glow-gold"
            style={{ background: 'var(--gold)', color: '#120e00' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Section>

      {/* Display */}
      <Section title="Display">
        <ToggleRow label="Show metadata on cards" sub="Dates and tags" value={showMeta} onChange={setShowMeta} />
        <ToggleRow label="Hover animations" sub="Scale and fade on hover" value={hoverAnims} onChange={setHoverAnims} />
      </Section>

      {/* Data Management */}
      <Section title="Data Management">
        <SettingRow label="Export vault metadata" sub="Download all data as JSON">
          <button onClick={handleExport} className="rounded-lg px-3 py-1.5 font-body text-xs transition-all"
            style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}>Export JSON</button>
        </SettingRow>
        <SettingRow label="Clear all data" sub="Permanently delete everything">
          <button onClick={handleClear} className="rounded-lg px-3 py-1.5 font-body text-xs transition-all"
            style={{ border: '1px solid var(--error)', color: 'var(--error)' }}>Clear Vault</button>
        </SettingRow>
      </Section>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-vault p-5" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
    <h3 className="font-display text-[17px] font-normal pb-3 mb-4" style={{ color: 'var(--cream)', borderBottom: '1px solid var(--bdr)' }}>{title}</h3>
    {children}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="font-mono-label text-[10px] tracking-[0.12em] uppercase block mb-2" style={{ color: 'var(--muted-text)' }}>{label}</label>
    {children}
  </div>
);

const ToggleRow: React.FC<{ label: string; sub: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, sub, value, onChange }) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--bdr)' }}>
    <div>
      <p className="font-body text-sm" style={{ color: 'var(--txt)' }}>{label}</p>
      <p className="font-body text-xs" style={{ color: 'var(--muted-text)' }}>{sub}</p>
    </div>
    <button onClick={() => onChange(!value)} className="relative w-[42px] h-[22px] rounded-full transition-colors"
      style={{ background: value ? 'var(--gold)' : 'var(--sur2)' }}>
      <div className="absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform"
        style={{ left: value ? 23 : 3 }} />
    </button>
  </div>
);

const SettingRow: React.FC<{ label: string; sub: string; children: React.ReactNode }> = ({ label, sub, children }) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--bdr)' }}>
    <div>
      <p className="font-body text-sm" style={{ color: 'var(--txt)' }}>{label}</p>
      <p className="font-body text-xs" style={{ color: 'var(--muted-text)' }}>{sub}</p>
    </div>
    {children}
  </div>
);

export default SettingsPage;
