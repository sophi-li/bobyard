const BASE_URL = 'http://localhost:3001';

export async function getComments() {
  let response = await fetch(`${BASE_URL}/comments`, {
    credentials: 'include'
  });
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
    credentials: 'include',
    body: JSON.stringify({ text, parent })
  });
  if (!response.ok) {
    throw new Error(`Error. Status: ${response.status}`);
  }
  const addedComment = await response.json();
  return addedComment;
}

export async function likeComment({ id, likes }) {
  let response = await fetch(`${BASE_URL}/comments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ likes })
  });

  if (!response.ok) {
    throw new Error(
      `Error. Status: ${response.status}. Failed to like comment`
    );
  }

  const likedComment = await response.json();
  return likedComment;
}
