// types.ts — the domain model. Kept separate from any storage shape so nullable /
// untrusted boundaries (localStorage JSON, parsed .md) never leak into the serializer.

/** Branded post number: a positive integer that is ALSO the image id (images/{N}.png). */
export type PostNumber = number & { readonly __brand: 'PostNumber' };

export function asPostNumber(n: number): PostNumber {
  if (!Number.isInteger(n) || n < 1) throw new Error(`invalid post_number: ${n}`);
  return n as PostNumber;
}

export type Author = 'cassie' | 'topher';

// Platform variants grouped so the serializer is TOTAL over platforms: adding a
// platform becomes a compile error at serialize(), which is exactly the failure we want.
export interface IgFbThreads {
  body: string;
  link: string | null;
}
export interface LinkedIn {
  body: string;
}
export interface XThread {
  main: string;
  comments: string[]; // contiguous, max 10 — enforced at the boundary + serializer
}
export interface Bluesky {
  body: string;
}

export interface PostContent {
  igFbThreads: IgFbThreads;
  linkedin: LinkedIn;
  x: XThread;
  bluesky: Bluesky;
}

/**
 * Status as a discriminated union carrying state-specific data. This resolves the
 * "send back with a note" case (the note only exists in changes_requested) without
 * scattering optional fields across every consumer.
 */
export type PostStatus =
  | { status: 'draft' }
  | { status: 'sent' }
  | { status: 'changes_requested'; note: string }
  | { status: 'approved' };

export type Post = PostStatus & {
  postNumber: PostNumber;
  title: string;
  author: Author;
  content: PostContent;
  needsImage: boolean;
  createdAt: string;
  updatedAt: string;
};

/** A read-only example parsed from the existing batches, shown in the Voice bank. */
export interface Example {
  postNumber: number;
  title: string;
  igFbThreads: string | null;
  linkedin: string | null;
  xMain: string | null;
  xComments: string[];
  bluesky: string | null;
}

export function emptyContent(): PostContent {
  return {
    igFbThreads: { body: '', link: null },
    linkedin: { body: '' },
    x: { main: '', comments: [] },
    bluesky: { body: '' },
  };
}
