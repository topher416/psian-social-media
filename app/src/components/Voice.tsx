import { useMemo, useState } from 'react';
import type { Example } from '../types';
import exampleData from '../data/examples.json';

const examples = exampleData as Example[];

function snippet(text: string | null, n = 220): string | null {
  if (!text) return null;
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > n ? clean.slice(0, n) + '…' : clean;
}

export function Voice() {
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return examples;
    return examples.filter((e) =>
      [e.title, e.igFbThreads, e.linkedin, e.xMain, e.bluesky]
        .filter(Boolean)
        .some((t) => (t as string).toLowerCase().includes(needle)),
    );
  }, [q]);

  return (
    <div className="card">
      <h2>Voice &amp; Examples</h2>
      <p className="muted small">
        {examples.length} real PsiAN posts to borrow phrasing, structure, and tone from. Search a topic,
        then open one to see every platform version.
      </p>
      <input
        placeholder="Search — e.g. depth therapy, insurance, research…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ margin: '10px 0 6px' }}
      />
      <p className="muted small">{filtered.length} matching</p>
      {filtered.map((e) => (
        <div className="example" key={e.postNumber}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <strong>#{e.postNumber} — {e.title}</strong>
            <button className="ghost small" onClick={() => setOpenId(openId === e.postNumber ? null : e.postNumber)}>
              {openId === e.postNumber ? 'Hide' : 'View all'}
            </button>
          </div>
          {openId !== e.postNumber && <div className="snip">{snippet(e.igFbThreads ?? e.linkedin ?? e.xMain ?? e.bluesky)}</div>}
          {openId === e.postNumber && (
            <div style={{ marginTop: 8 }}>
              {e.igFbThreads && <Block tag="Instagram / Facebook / Threads" text={e.igFbThreads} />}
              {e.linkedin && <Block tag="LinkedIn" text={e.linkedin} />}
              {e.xMain && <Block tag="X / Twitter thread" text={[e.xMain, ...e.xComments].join('\n\n— ')} />}
              {e.bluesky && <Block tag="Bluesky" text={e.bluesky} />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Block({ tag, text }: { tag: string; text: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="platform-tag">{tag}</div>
      <div className="snip">{text}</div>
    </div>
  );
}
