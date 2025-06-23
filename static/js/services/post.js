import { categories } from '../models/category.js';

export async function createPost(data) {
  if (!categories.includes(data.category)) {
    // TODO: handle no valid option (client injection)
    return;
  }
  const res = await fetch('/api/create-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.code !== 200) {
    // TODO: handle error
    // display a error msg
    return;
  }
}

export async function createComment(data) {
  data.user = {
    uuid: data.user.uuid,
    isConnected: data.user.isConnected,
  };
  const res = await fetch('/api/create-comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.code !== 200) {
    return;
  }
}

export async function getPosts(category = 'none', offset = 0, limit = 10) {
  try {
    const res = await fetch(`/api/posts?category=${category}&offset=${offset}&limit=${limit}`);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
    const result = await res.json();
    return result?.data || [];
  } catch (err) {
    console.error('Erreur lors du fetch des messages :', err);
    return [];
  }
}

export async function getComments(postUUID) {
  const res = await fetch(`/api/comments?post=${postUUID}`);
  const result = await res.json();
  if (result.code !== 200) {
    return;
  }
  return result.data.comments;
}
