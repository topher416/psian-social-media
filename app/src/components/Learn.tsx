import { LEARN, SITE_RESOURCES, STARTER_TOPICS, WORKFLOW_STEPS } from '../data/learn';

export function Learn() {
  return (
    <div className="learn">
      <section className="card learn-hero">
        <div className="eyebrow">Learn PsiAN</div>
        <h1>Clear purpose. Simple lanes. Real examples.</h1>
        <p className="lead">
          Cassie is helping keep PsiAN’s channels active with multiple posts each week. She does not need to be a social
          media expert first; the app gives her a topic, a few examples, and a structure to follow.
        </p>
        <div className="actions" style={{ marginTop: 14 }}>
          <a className="download-cta" href="/psian-claude-project-kit.zip" download>
            Download Claude project kit
          </a>
          <span className="muted small">Use this in a Claude Project for hooks, drafts, and social best practices.</span>
        </div>
      </section>

      <div className="learn-grid">
        {LEARN.map((section) => (
          <section className="card" key={section.id}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="card">
        <h2>How the workflow feels</h2>
        <div className="workflow-grid">
          {WORKFLOW_STEPS.map((step) => (
            <article className="workflow-step" key={step.id}>
              <div className="platform-tag">{step.title}</div>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Read PsiAN first</h2>
        <p className="muted small">These are the pages that should shape the draft before she writes.</p>
        <div className="resource-grid">
          {SITE_RESOURCES.map((resource) => (
            <a className="resource-card" key={resource.id} href={resource.href} target="_blank" rel="noreferrer">
              <strong>{resource.label}</strong>
              <span>{resource.note}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Topic lanes</h2>
        <div className="topic-grid learn-topics">
          {STARTER_TOPICS.map((topic) => (
            <article className="topic-card learn-topic" key={topic.id}>
              <strong>{topic.label}</strong>
              <span>{topic.objective}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
