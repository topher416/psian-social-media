import { LEARN } from '../data/learn';

export function Learn() {
  return (
    <div className="learn">
      <div className="review-flag">
        Draft onboarding content — Topher to replace with PsiAN-approved language.
      </div>
      {LEARN.map((s) => (
        <section className="card" key={s.id}>
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.bullets && (
            <ul>
              {s.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
