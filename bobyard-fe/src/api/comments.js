const BASE_URL = 'http://localhost:3001';
const ADMIN_USER = 'Admin';

export async function getComments() {
  let response = await fetch(`${BASE_URL}/comments`);
  if (!response.ok) {
    throw new Error(`Error. Status: ${response.status}`);
  }

  let results = await response.json();
  return results;
}

export async function createComment({ text, parent }) {
  let response = await fetch(`${BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, author: ADMIN_USER, parent })
  });
  if (!response.ok) {
    throw new Error(`Error. Status: ${response.status}`);
  }
  const addedComment = await response.json();
  return addedComment;
}

export async function likeComment({ id }) {
  let response = await fetch(`${BASE_URL}/comments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(
      `Error. Status: ${response.status}. Failed to like comment`
    );
  }

  const likedComment = await response.json();
  return likedComment;
}
