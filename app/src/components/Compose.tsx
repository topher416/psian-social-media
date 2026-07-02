import { useMemo, useState } from 'react';
import { CHAR_LIMITS, MAX_X_COMMENTS } from '../contract';
import { lintPost, graphemeLength, errorsOnly, type LintViolation } from '../lint';
import { serialize, SerializeError } from '../serialize';
import { newPost } from '../storage';
import exampleData from '../data/examples.json';
import { SITE_RESOURCES, STARTER_TOPICS } from '../data/learn';
import type { Example, Post, PostContent } from '../types';

const EXAMPLE_INDEX = new Map<number, Example>(exampleData.map((example) => [example.postNumber, example]));

function excerpt(text: string | null | undefined, n = 220): string {
  if (!text) return 'No preview available.';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > n ? `${clean.slice(0, n)}…` : clean;
}

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
  const [topicId, setTopicId] = useState(STARTER_TOPICS[0]?.id ?? 'cadence');
  const current = posts.find((p) => p.postNumber === selected) ?? null;
  const topic = STARTER_TOPICS.find((t) => t.id === topicId) ?? STARTER_TOPICS[0];
  const topicExamples = useMemo(
    () =>
      topic
        ? topic.examples
            .map((n) => EXAMPLE_INDEX.get(n))
            .filter((example): example is Example => Boolean(example))
            .slice(0, 3)
        : [],
    [topic],
  );

  const create = () => {
    const p = newPost(posts);
    upsert({
      ...p,
      title: topic ? `${topic.label} draft` : 'PsiAN draft',
    });
    setSelected(p.postNumber);
  };

  const selectTopic = (id: string) => {
    setTopicId(id);
  };

  return (
    <div className="compose-stack">
      <section className={`card compose-hero ${current ? '' : 'empty'}`}>
        <div className="eyebrow">Start here</div>
        <div className="compose-hero-grid">
          <div>
            <h1>Keep PsiAN active with a steady posting rhythm.</h1>
            <p className="lead">
              Cassie does not need prior social media experience. The job is to turn PsiAN’s existing
              publications and positions into multiple posts each week, with the app guiding topic choice,
              examples, and structure.
            </p>
            <div className="hero-notes">
              <div className="note-card">
                <strong>Purpose</strong>
                <span>Stay visible online with clear, regular posts.</span>
              </div>
              <div className="note-card">
                <strong>Inputs</strong>
                <span>PsiAN publications, positions, and past examples.</span>
              </div>
              <div className="note-card">
                <strong>Goal</strong>
                <span>Draft one topic at a time, then hand it off cleanly.</span>
              </div>
            </div>
          </div>
          <div className="hero-side">
            <div className="hero-side-card">
              <span className="platform-tag">How it works</span>
              <ol className="mini-steps">
                <li>Pick a topic.</li>
                <li>Read a few examples.</li>
                <li>Start a draft.</li>
              </ol>
            </div>
            <button className="primary-cta" onClick={create} type="button">
              Start a {topic?.label.toLowerCase() ?? 'draft'}
            </button>
            <div className="site-source-card">
              <span className="platform-tag">Read PsiAN first</span>
              <p>These pages should shape the angle, evidence, and tone before she starts drafting.</p>
              <div className="source-link-list">
                {SITE_RESOURCES.slice(0, 4).map((resource) => (
                  <a key={resource.id} href={resource.href} target="_blank" rel="noreferrer">
                    {resource.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="guided-layout">
        <section className="card">
          <div className="section-head">
            <div>
              <h2 style={{ marginBottom: 4 }}>Choose a topic</h2>
              <p className="muted small">Pick the lane that matches the source material. The examples update as you click.</p>
            </div>
          </div>
          <div className="topic-grid">
            {STARTER_TOPICS.map((starter) => (
              <button
                key={starter.id}
                type="button"
                className={`topic-card ${starter.id === topicId ? 'active' : ''}`}
                onClick={() => selectTopic(starter.id)}
              >
                <strong>{starter.label}</strong>
                <span>{starter.objective}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h2 style={{ marginBottom: 4 }}>{topic.label}</h2>
              <p className="muted small">{topic.prompt}</p>
            </div>
          </div>
          <div className="source-link-list topic-sources">
            {topic.sources.map((source) => (
              <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            ))}
          </div>
          <div className="example-stack">
            {topicExamples.map((example) => (
              <article className="example-card" key={example.postNumber}>
                <div className="example-card-top">
                  <strong>#{example.postNumber} {example.title}</strong>
                  <span className="platform-tag">Example</span>
                </div>
                <p>{excerpt(example.igFbThreads ?? example.linkedin ?? example.xMain ?? example.bluesky)}</p>
              </article>
            ))}
          </div>
          <div className="actions" style={{ marginTop: 14 }}>
            <button onClick={create} type="button">Start draft from this topic</button>
          </div>
        </section>
      </div>

      {current ? (
        <DraftEditor
          current={current}
          posts={posts}
          selected={selected}
          create={create}
          setSelected={setSelected}
          upsert={upsert}
          remove={remove}
          onExport={onExport}
        />
      ) : (
        <div className="card start-panel">
          <h2>Ready to begin</h2>
          <p className="muted">
            Pick a topic above, then start a draft. The examples will show the tone, and the editor will help keep the
            post aligned with PsiAN’s voice.
          </p>
        </div>
      )}
    </div>
  );
}

function DraftEditor({
  current,
  posts,
  selected,
  create,
  setSelected,
  upsert,
  remove,
  onExport,
}: {
  current: Post;
  posts: Post[];
  selected: number | null;
  create: () => void;
  setSelected: (value: number | null) => void;
  upsert: (p: Post) => void;
  remove: (n: number) => void;
  onExport: (markdown: string, filename: string, celebrate?: boolean) => void;
}) {
  const c = current.content;

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

  return (
    <div className="compose">
      <aside className="draftlist">
        <button onClick={create} style={{ width: '100%', marginBottom: 10 }} type="button">+ New post</button>
        {posts.map((p) => (
          <button
            key={p.postNumber}
            type="button"
            className={`item ${p.postNumber === selected ? 'active' : ''}`}
            onClick={() => setSelected(p.postNumber)}
          >
            <div className="t">#{p.postNumber} {p.title || <span className="muted">Untitled</span>}</div>
            <span className={`pill ${p.status}`}>{p.status.replace('_', ' ')}</span>
          </button>
        ))}
      </aside>

      <main>
        <div className="card">
          <div className="section-head">
            <div>
              <h2 style={{ marginBottom: 4 }}>Post #{current.postNumber}</h2>
              <p className="muted small">Use the examples above for tone and structure. The checks below catch the common mistakes.</p>
            </div>
            <span className={`pill ${current.status}`}>{current.status.replace('_', ' ')}</span>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label>Title (internal — not published)</label>
            <input
              value={current.title}
              onChange={(e) => upsert({ ...current, title: e.target.value })}
              placeholder="e.g. What people actually want from therapy"
            />
          </div>

          <div className="field">
            <label>Instagram / Facebook / Threads caption</label>
            <textarea
              rows={5}
              value={c.igFbThreads.body}
              onChange={(e) => patch({ igFbThreads: { ...c.igFbThreads, body: e.target.value } })}
              placeholder="Lead with one point from PsiAN, explain it in plain language, then close with a next step."
            />
            <Counter value={c.igFbThreads.body} limit={CHAR_LIMITS.threads} warn />
            <input
              style={{ marginTop: 8 }}
              placeholder="Optional link (single URL, no spaces)"
              value={c.igFbThreads.link ?? ''}
              onChange={(e) => patch({ igFbThreads: { ...c.igFbThreads, link: e.target.value || null } })}
            />
          </div>

          <div className="field">
            <label>LinkedIn (longer, professional)</label>
            <textarea
              rows={5}
              value={c.linkedin.body}
              onChange={(e) => patch({ linkedin: { body: e.target.value } })}
              placeholder="Use a slightly more formal summary, then connect the point back to PsiAN’s mission."
            />
            <Counter value={c.linkedin.body} limit={CHAR_LIMITS.linkedin} />
          </div>

          <div className="field">
            <label>X / Twitter thread — main post</label>
            <textarea
              rows={2}
              value={c.x.main}
              onChange={(e) => patch({ x: { ...c.x, main: e.target.value } })}
              placeholder="Write the thesis in one short sentence, then let the replies carry the detail."
            />
            <Counter value={c.x.main} limit={CHAR_LIMITS.x} />
            {c.x.comments.map((cm, i) => (
              <div className="comment-row" key={i}>
                <div style={{ flex: 1 }}>
                  <textarea
                    rows={2}
                    value={cm}
                    placeholder={`Reply ${i + 1}`}
                    onChange={(e) => {
                      const comments = c.x.comments.slice();
                      comments[i] = e.target.value;
                      patch({ x: { ...c.x, comments } });
                    }}
                  />
                  <Counter value={cm} limit={CHAR_LIMITS.x} />
                </div>
                <button
                  className="danger small"
                  type="button"
                  onClick={() => patch({ x: { ...c.x, comments: c.x.comments.filter((_, j) => j !== i) } })}
                >
                  ×
                </button>
              </div>
            ))}
            {c.x.comments.length < MAX_X_COMMENTS && (
              <button
                className="ghost small"
                type="button"
                onClick={() => patch({ x: { ...c.x, comments: [...c.x.comments, ''] } })}
              >
                + Add reply
              </button>
            )}
          </div>

          <div className="field">
            <label>Bluesky (short)</label>
            <textarea
              rows={3}
              value={c.bluesky.body}
              onChange={(e) => patch({ bluesky: { body: e.target.value } })}
              placeholder="Keep it compact, direct, and easy to repost."
            />
            <Counter value={c.bluesky.body} limit={CHAR_LIMITS.bluesky} />
          </div>

          <div className="hint">
            Needs an image: <code>images/{current.postNumber}.png</code> (1080×1080).
            <label style={{ display: 'inline', marginLeft: 6 }}>
              <input
                type="checkbox"
                style={{ width: 'auto', marginRight: 4 }}
                checked={!current.needsImage}
                onChange={(e) => upsert({ ...current, needsImage: !e.target.checked })}
              />
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
            <button onClick={send} disabled={errors.length > 0} type="button">Send to Topher</button>
            <button
              className="ghost"
              onClick={() => { try { onExport(serialize(current), `post-${current.postNumber}.md`); } catch { /* blocked by errors */ } }}
              disabled={errors.length > 0}
              type="button"
            >
              Preview export
            </button>
            <button className="ghost" type="button" onClick={() => upsert({ ...current, status: 'approved' })}>Mark approved</button>
            <button
              className="ghost"
              type="button"
              onClick={() => {
                const note = window.prompt('What should change?') ?? '';
                if (note) upsert({ ...current, status: 'changes_requested', note });
              }}
            >
              Request changes
            </button>
            <button
              className="danger"
              type="button"
              onClick={() => {
                remove(current.postNumber);
                setSelected(posts.find((p) => p.postNumber !== current.postNumber)?.postNumber ?? null);
              }}
            >
              Delete
            </button>
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
