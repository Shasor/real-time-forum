import { categories } from '../models/category.js';

export async function createPost(data) {
  if (!categories.includes(data.category)) {
    // TODO: handle no valid option (client injection)
    return;
  }
  data.user = {
    uuid: data.user.uuid,
    isConnected: data.user.isConnected,
  };
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

export async function getPosts(category) {
  const res = await fetch(!category ? '/api/posts' : `/api/posts?category=${category}`, { method: 'POST' });
  const result = await res.json();
  if (result.code !== 200) {
    // to do
    // display a error msg
    return;
  }
  return result.data.posts;
}

export async function getComments(postUUID) {
  const res = await fetch(`/api/comments?post=${postUUID}`, { method: 'POST' });
  const result = await res.json();
  if (result.code !== 200) {
    return;
  }
  return result.data.comments;
}