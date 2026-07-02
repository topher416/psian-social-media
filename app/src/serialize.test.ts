import { describe, it, expect } from 'vitest';
import { serialize, SerializeError } from './serialize';
import { asPostNumber, emptyContent, type Post } from './types';

function makePost(over: Partial<Post['content']> = {}, title = 'Access to Depth Therapy'): Post {
  return {
    status: 'draft',
    postNumber: asPostNumber(81),
    title,
    author: 'cassie',
    needsImage: true,
    createdAt: '',
    updatedAt: '',
    content: { ...emptyContent(), ...over },
  };
}

describe('serialize', () => {
  it('produces the exact block shape (golden)', () => {
    const post = makePost({
      igFbThreads: { body: 'Depth therapy helps people heal. Learn more.', link: 'https://psian.org' },
      linkedin: { body: 'A longer professional take on access to therapy.' },
      x: { main: 'Depth therapy helps people heal.', comments: ['Ninety percent want it.', 'Follow along.'] },
      bluesky: { body: 'Depth therapy helps people heal. psian.org' },
    });
    expect(serialize(post)).toBe(
      `## Post 81: Access to Depth Therapy

### Instagram/Facebook/Threads Version
Depth therapy helps people heal. Learn more.

**Link**: https://psian.org

### LinkedIn Version
A longer professional take on access to therapy.

### X/Twitter Thread Version
**Main post**: Depth therapy helps people heal.

**comment1**: Ninety percent want it.

**comment2**: Follow along.

### Bluesky Version
Depth therapy helps people heal. psian.org
`,
    );
  });

  it('omits empty sections (never emits an empty ### heading)', () => {
    const post = makePost({ linkedin: { body: 'Only LinkedIn here.' } });
    const out = serialize(post);
    expect(out).toContain('### LinkedIn Version');
    expect(out).not.toContain('Instagram/Facebook/Threads Version');
    expect(out).not.toContain('Bluesky Version');
  });

  it('densifies comments (drops blanks, renumbers contiguously, caps at 10)', () => {
    const post = makePost({
      x: { main: 'Main', comments: ['one', '  ', 'three'] },
    });
    const out = serialize(post);
    expect(out).toContain('**comment1**: one');
    expect(out).toContain('**comment2**: three'); // "three" renumbered to 2, blank dropped
    expect(out).not.toContain('**comment3**');
  });

  it('throws on blocking violations rather than emitting bad markdown', () => {
    const post = makePost({ bluesky: { body: 'nope 🎉' } });
    expect(() => serialize(post)).toThrow(SerializeError);
  });

  it('throws when there is nothing but a header', () => {
    expect(() => serialize(makePost())).toThrow(SerializeError);
  });
});
