export interface LearnSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface StarterTopic {
  id: string;
  label: string;
  objective: string;
  prompt: string;
  examples: number[];
  sources: { label: string; href: string }[];
}

export interface SiteResource {
  id: string;
  label: string;
  href: string;
  note: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  body: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'purpose',
    title: '1. Keep PsiAN visible',
    body: 'The job is to keep PsiAN’s social channels active with multiple posts each week.',
  },
  {
    id: 'topic',
    title: '2. Pick one topic',
    body: 'Choose the lane that matches the source material, then use examples to guide the tone.',
  },
  {
    id: 'draft',
    title: '3. Draft from the source',
    body: 'Turn existing PsiAN publications and positions into a clear post for each platform.',
  },
];

export const STARTER_TOPICS: StarterTopic[] = [
  {
    id: 'cadence',
    label: 'Weekly cadence',
    objective: 'Keep the channels moving this week without starting from zero.',
    prompt: 'Use a recent PsiAN position or publication and turn it into one clear, concise post.',
    examples: [16, 19, 30],
    sources: [
      { label: 'Publications', href: 'https://www.psian.org/publications' },
      { label: 'Blog', href: 'https://www.psian.org/blog' },
    ],
  },
  {
    id: 'therapy',
    label: 'Therapy basics',
    objective: 'Explain what makes depth-oriented therapy different and why it matters.',
    prompt: 'Summarize a PsiAN belief about therapy in plain language and end with a simple next step.',
    examples: [5, 6, 7],
    sources: [
      { label: 'Home', href: 'https://www.psian.org/' },
      { label: 'Case for Depth Therapy', href: 'https://www.psian.org/the-case-for-depth-therapy' },
      { label: 'Publications', href: 'https://www.psian.org/publications' },
    ],
  },
  {
    id: 'research',
    label: 'Research and evidence',
    objective: 'Translate a study or statistic into a readable social post.',
    prompt: 'Lead with the takeaway, explain why it matters, then point back to PsiAN’s position.',
    examples: [19, 29, 33],
    sources: [
      { label: 'Publications', href: 'https://www.psian.org/publications' },
      { label: 'Library', href: 'https://www.psian.org/library' },
    ],
  },
  {
    id: 'ai',
    label: 'AI and privacy',
    objective: 'Write about AI, privacy, and other risks without sounding alarmist.',
    prompt: 'Use a measured tone, stick to the facts, and end with a clear PsiAN stance.',
    examples: [1, 2, 18],
    sources: [
      { label: 'Tech', href: 'https://www.psian.org/tech' },
      { label: 'PsiAN’s position on mental health apps', href: 'https://www.psian.org/blog/psians-position-on-mental-health-apps' },
      { label: 'Advocacy', href: 'https://www.psian.org/advocacy' },
    ],
  },
  {
    id: 'access',
    label: 'Insurance and access',
    objective: 'Explain barriers to care and what PsiAN is pushing to change.',
    prompt: 'Use one concrete barrier, one plain-language consequence, and one action for readers.',
    examples: [21, 25, 26],
    sources: [
      { label: 'Advocacy', href: 'https://www.psian.org/advocacy' },
      { label: 'Insurance guide', href: 'https://www.psian.org/claim-denials-psychotherapists' },
      { label: 'Private practice hub', href: 'https://www.psian.org/private-psychotherapy-practice' },
    ],
  },
  {
    id: 'spotlight',
    label: 'Member spotlight',
    objective: 'Highlight a person, partner, or publication that reflects PsiAN’s values.',
    prompt: 'Introduce the person or partner, then connect their work back to PsiAN’s mission.',
    examples: [14, 15, 37],
    sources: [
      { label: 'Media', href: 'https://www.psian.org/media' },
      { label: 'Blog', href: 'https://www.psian.org/blog' },
      { label: 'Publications', href: 'https://www.psian.org/publications' },
    ],
  },
];

export const SITE_RESOURCES: SiteResource[] = [
  {
    id: 'claude-kit',
    label: 'Claude project kit',
    href: '/psian-claude-project-kit.zip',
    note: 'Download this when you want Claude to help with hooks, post drafts, and social best practices.',
  },
  {
    id: 'home',
    label: 'PsiAN home',
    href: 'https://www.psian.org/',
    note: 'Fast read for the mission: psychotherapy is human care, and the site frames the organization around access and clinical standards.',
  },
  {
    id: 'mission',
    label: 'Mission and values',
    href: 'https://www.psian.org/mission-and-values',
    note: 'Use this to keep the tone grounded, direct, and aligned with PsiAN’s actual mission.',
  },
  {
    id: 'depth',
    label: 'Case for depth therapy',
    href: 'https://www.psian.org/the-case-for-depth-therapy',
    note: 'Best source for the core proof points about depth, insight, relationship, effectiveness, and what patients want.',
  },
  {
    id: 'publications',
    label: 'Publications',
    href: 'https://www.psian.org/publications',
    note: 'Use for articles, toolkit language, book references, and recurring themes.',
  },
  {
    id: 'advocacy',
    label: 'Advocacy',
    href: 'https://www.psian.org/advocacy',
    note: 'Current positions and policy alerts that can shape timely posts.',
  },
  {
    id: 'insurance',
    label: 'Insurance guide',
    href: 'https://www.psian.org/claim-denials-psychotherapists',
    note: 'Useful for access, denials, appeals, and practical language about barriers to care.',
  },
  {
    id: 'practice',
    label: 'Private practice hub',
    href: 'https://www.psian.org/private-psychotherapy-practice',
    note: 'Best source for PMC, autonomy, and corporate-care framing.',
  },
  {
    id: 'tech',
    label: 'Tech',
    href: 'https://www.psian.org/tech',
    note: 'Use for AI, apps, privacy, and automated-substitute messaging.',
  },
  {
    id: 'library',
    label: 'Library',
    href: 'https://www.psian.org/library',
    note: 'Research-backed material when she needs citations and evidence language.',
  },
  {
    id: 'blog',
    label: 'Blog',
    href: 'https://www.psian.org/blog',
    note: 'Good for current phrasing, recent issues, and how PsiAN talks about ongoing work.',
  },
];

export const LEARN: LearnSection[] = [
  {
    id: 'purpose',
    heading: 'What Cassie is doing',
    paragraphs: [
      'Keep PsiAN’s social channels active with multiple posts each week.',
      'Build each post from PsiAN’s existing publications and positions so the voice stays consistent.',
    ],
  },
  {
    id: 'how',
    heading: 'How to use the app',
    paragraphs: [
      'Pick a topic, open a few examples, then draft one platform version at a time.',
    ],
    bullets: [
      'Choose a topic lane that matches the source material.',
      'Borrow structure from the examples, not just the wording.',
      'Use the built-in checks to keep the draft clean.',
    ],
  },
  {
    id: 'who',
    heading: 'Who this is for',
    paragraphs: [
      'Cassie does not need prior social media experience to do this job well.',
      'The app is meant to guide the process so the work feels structured instead of blank.',
    ],
  },
  {
    id: 'voice',
    heading: 'PsiAN’s voice',
    paragraphs: [
      'PsiAN sounds professional, measured, and educational.',
    ],
    bullets: [
      'Use a clear point of view without hype or fear.',
      'Keep the tone informative and direct.',
      'End with a simple next step when possible.',
    ],
  },
  {
    id: 'guardrails',
    heading: 'Helpful guardrails',
    paragraphs: [
      'The app flags handle usage, length, and other common mistakes so she does not have to memorize them.',
    ],
    bullets: [
      'No ALL CAPS and no heavy punctuation.',
      'Use @PsiAN and psian.org where relevant.',
      'Rely on the examples when you need a model.',
    ],
  },
];
