import type { Post } from '../types';

// A quarter of content at PsiAN's cadence (~3 unique posts/week × 13 weeks).
const QUARTER_GOAL = 36;

export function Progress({ posts }: { posts: Post[] }) {
  const drafted = posts.length;
  const sent = posts.filter((p) => p.status === 'sent').length;
  const approved = posts.filter((p) => p.status === 'approved').length;
  const done = sent + approved;
  const pct = Math.min(100, Math.round((done / QUARTER_GOAL) * 100));
  const weeks = (done / 3).toFixed(1);

  return (
    <div className="card">
      <h2>Your progress</h2>
      <p className="muted">
        {done === 0
          ? "Every quarter of PsiAN content starts with one post. Head to Compose and write your first."
          : `That's about ${weeks} weeks of PsiAN content — built by you. Keep going!`}
      </p>
      <div className="bar" aria-label={`${pct}% of a quarter`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="small muted">{done} of {QUARTER_GOAL} posts toward a full quarter ({pct}%)</p>
      <div className="stats">
        <div><div className="n">{drafted}</div><div className="small muted">in progress</div></div>
        <div><div className="n">{sent}</div><div className="small muted">sent to Topher</div></div>
        <div><div className="n">{approved}</div><div className="small muted">approved</div></div>
      </div>
    </div>
  );
}
