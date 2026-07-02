import { useState } from 'react';
import { CHAR_LIMITS, MAX_X_COMMENTS } from '../contract';
import { lintPost, graphemeLength, errorsOnly, type LintViolation } from '../lint';
import { serialize, SerializeError } from '../serialize';
import { newPost } from '../storage';
import type { Post, PostContent } from '../types';

function Counter({ value, limit, warn }: { value: string; limit: number; warn?: boolean }) {
  const n = graphemeLength(value);
  const cls = n > limit ? 'counter over' : warn && n > limit ? 'counter warn' : 'counter';
  return <div className={cls}>{n} / {limit}</div>;
}

export function Compose({
  posts,
  upsert,
  remove,
  onExport,
}: {
  posts: Post[];
  upsert: (p: Post) => void;
  remove: (n: number) => void;
  onExport: (markdown: string, filename: string, celebrate?: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(posts[0]?.postNumber ?? null);
  const current = posts.find((p) => p.postNumber === selected) ?? null;

  const create = () => {
    const p = newPost(posts);
    upsert(p);
    setSelected(p.postNumber);
  };

  if (!current) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>Let’s write your first post ✍️</h2>
        <p className="muted">Nothing here yet. Start a draft — the app checks your work as you go.</p>
        <button onClick={create}>New post</button>
      </div>
    );
  }

  const patch = (content: Partial<PostContent>) =>
    upsert({ ...current, content: { ...current.content, ...content } });

  const violations = lintPost(current);
  const errors = errorsOnly(violations);
  const warns = violations.filter((v) => v.severity === 'warn');

  const send = () => {
    try {
      const md = serialize(current);
      upsert({ ...current, status: 'sent' });
      onExport(md, `post-${current.postNumber}.md`, true);
    } catch (e) {
      if (!(e instanceof SerializeError)) throw e;
    }
  };

  const c = current.content;

  return (
    <div className="compose">
      <aside className="draftlist">
        <button onClick={create} style={{ width: '100%', marginBottom: 10 }}>+ New post</button>
        {posts.map((p) => (
          <div
            key={p.postNumber}
            className={`item ${p.postNumber === selected ? 'active' : ''}`}
            onClick={() => setSelected(p.postNumber)}
          >
            <div className="t">#{p.postNumber} {p.title || <span className="muted">Untitled</span>}</div>
            <span className={`pill ${p.status}`}>{p.status.replace('_', ' ')}</span>
          </div>
        ))}
      </aside>

      <main>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Post #{current.postNumber}</h2>
            <span className={`pill ${current.status}`}>{current.status.replace('_', ' ')}</span>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label>Title (internal — not published)</label>
            <input value={current.title} onChange={(e) => upsert({ ...current, title: e.target.value })} placeholder="e.g. What people actually want from therapy" />
          </div>

          <div className="field">
            <label>Instagram / Facebook / Threads caption</label>
            <textarea rows={5} value={c.igFbThreads.body} onChange={(e) => patch({ igFbThreads: { ...c.igFbThreads, body: e.target.value } })} />
            <Counter value={c.igFbThreads.body} limit={CHAR_LIMITS.threads} warn />
            <input style={{ marginTop: 8 }} placeholder="Optional link (single URL, no spaces)" value={c.igFbThreads.link ?? ''} onChange={(e) => patch({ igFbThreads: { ...c.igFbThreads, link: e.target.value || null } })} />
          </div>

          <div className="field">
            <label>LinkedIn (longer, professional)</label>
            <textarea rows={5} value={c.linkedin.body} onChange={(e) => patch({ linkedin: { body: e.target.value } })} />
            <Counter value={c.linkedin.body} limit={CHAR_LIMITS.linkedin} />
          </div>

          <div className="field">
            <label>X / Twitter thread — main post</label>
            <textarea rows={2} value={c.x.main} onChange={(e) => patch({ x: { ...c.x, main: e.target.value } })} />
            <Counter value={c.x.main} limit={CHAR_LIMITS.x} />
            {c.x.comments.map((cm, i) => (
              <div className="comment-row" key={i}>
                <div style={{ flex: 1 }}>
                  <textarea rows={2} value={cm} placeholder={`Reply ${i + 1}`} onChange={(e) => {
                    const comments = c.x.comments.slice();
                    comments[i] = e.target.value;
                    patch({ x: { ...c.x, comments } });
                  }} />
                  <Counter value={cm} limit={CHAR_LIMITS.x} />
                </div>
                <button className="danger small" onClick={() => patch({ x: { ...c.x, comments: c.x.comments.filter((_, j) => j !== i) } })}>×</button>
              </div>
            ))}
            {c.x.comments.length < MAX_X_COMMENTS && (
              <button className="ghost small" onClick={() => patch({ x: { ...c.x, comments: [...c.x.comments, ''] } })}>+ Add reply</button>
            )}
          </div>

          <div className="field">
            <label>Bluesky (short)</label>
            <textarea rows={3} value={c.bluesky.body} onChange={(e) => patch({ bluesky: { body: e.target.value } })} />
            <Counter value={c.bluesky.body} limit={CHAR_LIMITS.bluesky} />
          </div>

          <div className="hint">
            🖼️ Needs an image: <code>images/{current.postNumber}.png</code> (1080×1080). Topher/Canva handles the art —
            <label style={{ display: 'inline', marginLeft: 6 }}>
              <input type="checkbox" style={{ width: 'auto', marginRight: 4 }} checked={!current.needsImage} onChange={(e) => upsert({ ...current, needsImage: !e.target.checked })} />
              image ready
            </label>
          </div>
        </div>

        <div className="card lint">
          <h3>Checks</h3>
          {errors.length === 0 && warns.length === 0 && <div className="ok">✓ All clear — ready to send.</div>}
          {errors.map((v, i) => <LintRow key={`e${i}`} v={v} />)}
          {warns.map((v, i) => <LintRow key={`w${i}`} v={v} />)}
          <div className="actions">
            <button onClick={send} disabled={errors.length > 0}>Send to Topher</button>
            <button className="ghost" onClick={() => { try { onExport(serialize(current), `post-${current.postNumber}.md`); } catch { /* blocked by errors */ } }} disabled={errors.length > 0}>Preview export</button>
            {/* lightweight reviewer controls */}
            <button className="ghost" onClick={() => upsert({ ...current, status: 'approved' })}>Mark approved</button>
            <button className="ghost" onClick={() => {
              const note = window.prompt('What should change?') ?? '';
              if (note) upsert({ ...current, status: 'changes_requested', note });
            }}>Request changes</button>
            <button className="danger" onClick={() => { remove(current.postNumber); setSelected(posts.find((p) => p.postNumber !== current.postNumber)?.postNumber ?? null); }}>Delete</button>
          </div>
          {current.status === 'changes_requested' && (
            <div className="v warn" style={{ marginTop: 10 }}>Topher asked: {current.note}</div>
          )}
        </div>
      </main>
    </div>
  );
}

function LintRow({ v }: { v: LintViolation }) {
  return <div className={`v ${v.severity}`}>{v.severity === 'error' ? '⚠️' : '💡'} {v.message}</div>;
}
