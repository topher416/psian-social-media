import { describe, it, expect } from 'vitest';
import { checkText, lintPost, graphemeLength } from './lint';
import { asPostNumber, emptyContent, type Post } from './types';

function makePost(over: Partial<Post['content']> = {}): Post {
  return {
    status: 'draft',
    postNumber: asPostNumber(81),
    title: 'Test',
    author: 'cassie',
    needsImage: true,
    createdAt: '',
    updatedAt: '',
    content: { ...emptyContent(), ...over },
  };
}

describe('checkText', () => {
  it('flags emojis', () => {
    expect(checkText('Great work 🎉', 'bluesky').some((v) => v.code === 'emoji')).toBe(true);
  });
  it('flags markdown emphasis', () => {
    expect(checkText('this is **bold**', 'linkedin').some((v) => v.code === 'markdown_emphasis')).toBe(true);
    expect(checkText('this is *italic*', 'linkedin').some((v) => v.code === 'markdown_emphasis')).toBe(true);
    expect(checkText('this is _italic_', 'linkedin').some((v) => v.code === 'markdown_emphasis')).toBe(true);
  });
  it('flags a mistyped PsiAN handle but not legit mentions', () => {
    expect(checkText('follow @PsiikiAN', 'x_main').some((v) => v.code === 'wrong_handle')).toBe(true);
    expect(checkText('thanks @PartnerOrg', 'x_main').some((v) => v.code === 'wrong_handle')).toBe(false);
    expect(checkText('follow @PsiAN', 'x_main').some((v) => v.code === 'wrong_handle')).toBe(false);
  });
  it('flags a "## Post" line as a phantom-post risk', () => {
    expect(checkText('intro\n## Post 5: oops', 'igFbThreads').some((v) => v.code === 'boundary_token')).toBe(true);
  });
  it('flags a leading-# heading line as a truncation risk', () => {
    expect(checkText('### subhead', 'igFbThreads').some((v) => v.code === 'boundary_token')).toBe(true);
  });
  it('passes clean text', () => {
    expect(checkText('Clean caption about access to therapy. See psian.org', 'igFbThreads')).toHaveLength(0);
  });
});

describe('graphemeLength', () => {
  it('counts emoji as one grapheme, not two UTF-16 units', () => {
    expect('👍'.length).toBe(2);
    expect(graphemeLength('👍')).toBe(1);
  });
});

describe('lintPost char limits', () => {
  it('errors when X main exceeds 280', () => {
    const post = makePost({ x: { main: 'a'.repeat(281), comments: [] } });
    expect(lintPost(post).some((v) => v.code === 'over_char_limit' && v.severity === 'error')).toBe(true);
  });
  it('warns (not errors) when the shared caption exceeds the 500 Threads limit', () => {
    const post = makePost({ igFbThreads: { body: 'a'.repeat(600), link: null } });
    const v = lintPost(post).filter((x) => x.code === 'over_char_limit');
    expect(v.some((x) => x.severity === 'warn')).toBe(true);
    expect(v.some((x) => x.severity === 'error')).toBe(false); // still under IG's 2200
  });
});
