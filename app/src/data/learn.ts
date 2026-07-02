// learn.ts — onboarding content for the "Learn PsiAN" tab.
//
// ⚠️ DRAFT FOR TOPHER'S REVIEW. Synthesized from the existing posts, CLAUDE.md, and
// WORKFLOW.md in this repo — not from official PsiAN source material yet. Replace/refine
// the copy with PsiAN-approved language before Cassie relies on it. (House style: "health
// care" as two words; PsiAN's own published copy uses "mental healthcare" and is quoted as-is.)

export interface LearnSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export const LEARN: LearnSection[] = [
  {
    id: 'welcome',
    heading: 'Hi Cassie — welcome to the team 👋',
    paragraphs: [
      "You're helping the Psychotherapy Action Network (PsiAN) reach people who care about real, lasting mental health care. This is volunteer work, and it matters: you're giving a small but mighty advocacy organization a consistent voice online.",
      "Your job isn't to invent a message from scratch. PsiAN already has a clear point of view and a library of writing. Your job is to turn that into steady, well-crafted social posts — and this app is built to make that feel easy and even fun.",
    ],
  },
  {
    id: 'who',
    heading: 'Who is PsiAN?',
    paragraphs: [
      'PsiAN — the Psychotherapy Action Network — is a nonprofit advocacy organization fighting to protect public access to therapies of depth, insight, and relationship: the kind of therapy that helps people get to the root of their problems, not just manage symptoms.',
      'They bring together clinicians, researchers, and advocates to push back on the forces reshaping mental health care — and to keep meaningful psychotherapy available and understood.',
    ],
  },
  {
    id: 'why',
    heading: 'Why the work matters',
    paragraphs: [
      "In PsiAN's national research, about 90 percent of Americans said they want therapy that helps them get to the root of their problems — not just short-term symptom management. But the marketplace increasingly sells the opposite: app-based “solutions,” symptom checklists, and quick fixes designed to scale rather than to heal.",
      'PsiAN names that gap plainly and organizes to close it — through public education, research, policy comments, and coalition-building with partner organizations.',
    ],
    bullets: [
      'Access — keeping depth-oriented therapy available and covered.',
      'Corporate capture — scrutinizing how venture capital, private equity, and insurer-owned platforms are reshaping care.',
      'Public understanding — helping people know what good therapy actually looks like.',
    ],
  },
  {
    id: 'role',
    heading: 'What you’ll actually do',
    paragraphs: [
      'Draft social posts for PsiAN across platforms, using the voice and source material already in this app. You compose; Topher reviews and does the final publish. You’ll build up weeks — then months — of content, and you’ll join a short monthly call with the PsiAN team (with Topher there too).',
    ],
    bullets: [
      'Write in the Compose tab — the app checks your work as you go.',
      'Borrow phrasing and structure from the Voice & Examples tab (80 real past posts).',
      'When a post is ready, hit “Send to Topher” — that hands off a clean file for publishing.',
      'Watch your progress fill up toward a full quarter of content.',
    ],
  },
  {
    id: 'voice',
    heading: 'The PsiAN voice (your north star)',
    paragraphs: [
      'PsiAN sounds professional, measured, and educational — never alarmist. Cite research when you can, and always end with a clear next step.',
    ],
    bullets: [
      'Professional and measured — no hype, no fear-based language.',
      'Educational, not alarmist — explain, don’t shout.',
      'No ALL CAPS, no excessive punctuation (!!!), no emojis.',
      'Use the handle @PsiAN, and point people to psian.org.',
      'The app flags all of these for you automatically — you don’t have to memorize them.',
    ],
  },
];
