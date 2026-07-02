// storage.ts — localStorage persistence (v1, no backend). Every change is written
// synchronously to localStorage; there is also an explicit JSON export/import so a
// lost device is never catastrophic. If cross-device sync ever becomes a real pain,
// this module is the single seam to swap for Supabase (see the plan's Persistence Decision).

import { useCallback, useEffect, useState } from 'react';
import { NUMBERING_BASE } from './contract';
import { asPostNumber, emptyContent, type Post } from './types';

const KEY = 'psian.posts.v1';

function nowIso(): string {
  // new Date() is fine in the browser; only the workflow runtime forbids it.
  return new Date().toISOString();
}

export function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Post[]) : [];
  } catch {
    return [];
  }
}

function persist(posts: Post[]): void {
  localStorage.setItem(KEY, JSON.stringify(posts));
}

export function nextPostNumber(posts: Post[]): number {
  const max = posts.reduce((m, p) => Math.max(m, p.postNumber), NUMBERING_BASE - 1);
  return max + 1;
}

export function newPost(posts: Post[]): Post {
  const n = nextPostNumber(posts);
  return {
    status: 'draft',
    postNumber: asPostNumber(n),
    title: '',
    author: 'cassie',
    needsImage: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    content: emptyContent(),
  };
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>(loadPosts);

  useEffect(() => {
    persist(posts);
  }, [posts]);

  const upsert = useCallback((post: Post) => {
    setPosts((prev) => {
      const next = { ...post, updatedAt: nowIso() };
      const i = prev.findIndex((p) => p.postNumber === post.postNumber);
      if (i === -1) return [...prev, next];
      const copy = prev.slice();
      copy[i] = next;
      return copy;
    });
  }, []);

  const remove = useCallback((postNumber: number) => {
    setPosts((prev) => prev.filter((p) => p.postNumber !== postNumber));
  }, []);

  const replaceAll = useCallback((next: Post[]) => setPosts(next), []);

  return { posts, upsert, remove, replaceAll };
}
