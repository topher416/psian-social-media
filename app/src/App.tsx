import { useState } from 'react';
import confetti from 'canvas-confetti';
import { usePosts } from './storage';
import { serializeAll } from './serialize';
import type { Post } from './types';
import { Learn } from './components/Learn';
import { Voice } from './components/Voice';
import { Compose } from './components/Compose';
import { Progress } from './components/Progress';
import { ExportDialog } from './components/ExportDialog';

type Tab = 'learn' | 'voice' | 'compose' | 'progress';
const TABS: { id: Tab; label: string }[] = [
  { id: 'compose', label: 'Start here' },
  { id: 'voice', label: '📚 Voice & Examples' },
  { id: 'learn', label: '💡 Learn PsiAN' },
  { id: 'progress', label: '📈 Progress' },
];

const PASSPHRASE = (import.meta.env.VITE_APP_PASSPHRASE as string) || 'psian';
const GATE_KEY = 'psian.unlocked';

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(GATE_KEY) === '1');
  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;
  return <Workspace />;
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [err, setErr] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASSPHRASE) {
      sessionStorage.setItem(GATE_KEY, '1');
      onUnlock();
    } else setErr(true);
  };
  return (
    <div className="gate">
      <form className="card" onSubmit={submit}>
        <div className="logo" style={{ fontSize: 22 }}>PsiAN Social</div>
        <p className="muted small">Multiple posts each week, built from PsiAN’s own publications and positions.</p>
        <input autoFocus type="password" placeholder="Passphrase" value={value} onChange={(e) => { setValue(e.target.value); setErr(false); }} style={{ margin: '12px 0' }} />
        {err && <div className="v error" style={{ marginBottom: 10 }}>Not quite — try again.</div>}
        <button type="submit" style={{ width: '100%' }}>Enter</button>
      </form>
    </div>
  );
}

function Workspace() {
  const { posts, upsert, remove, replaceAll } = usePosts();
  const [tab, setTab] = useState<Tab>('compose');
  const [exp, setExp] = useState<{ markdown: string; filename: string } | null>(null);

  const openExport = (markdown: string, filename: string, celebrate = false) => {
    setExp({ markdown, filename });
    if (celebrate) confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  };

  const ready = posts.filter((p) => p.status === 'sent' || p.status === 'approved');
  const exportAll = () => {
    if (ready.length) openExport(serializeAll(ready), 'batch3.md', false);
  };

  const backup = () => {
    const blob = new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'psian-drafts-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const restore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((t) => {
      try {
        const parsed = JSON.parse(t) as Post[];
        if (Array.isArray(parsed)) replaceAll(parsed);
      } catch { /* ignore malformed */ }
    });
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">PsiAN Social<small>Guided drafting for steady social output</small></div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
      </header>

      {tab === 'compose' && <Compose posts={posts} upsert={upsert} remove={remove} onExport={openExport} />}
      {tab === 'voice' && <Voice />}
      {tab === 'learn' && <Learn />}
      {tab === 'progress' && (
        <>
          <Progress posts={posts} />
          <div className="card">
            <h3>Hand-off &amp; backup</h3>
            <div className="actions">
              <button onClick={exportAll} disabled={!ready.length}>Export all ready posts ({ready.length})</button>
              <button className="ghost" onClick={backup}>Download JSON backup</button>
              <label className="tab" style={{ border: '1px solid var(--line)', borderRadius: 10 }}>
                Restore from backup
                <input type="file" accept="application/json" onChange={restore} style={{ display: 'none' }} />
              </label>
            </div>
            <p className="small muted" style={{ marginTop: 8 }}>Your work saves automatically in this browser. Download a JSON backup now and then so a lost device is never a lost draft.</p>
          </div>
        </>
      )}

      {exp && <ExportDialog markdown={exp.markdown} filename={exp.filename} onClose={() => setExp(null)} />}
    </div>
  );
}
