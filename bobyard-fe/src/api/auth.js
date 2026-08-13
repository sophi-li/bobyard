const BASE_URL = 'http://localhost:3001';

export async function signup({ username, password }) {
  let response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Error. Status: ${response.status}`);
  }
  return data;
}

export async function login({ username, password }) {
  let response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Error. Status: ${response.status}`);
  }
  return data;
}

export async function logout() {
  let response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(`Error. Status: ${response.status}`);
  }
  return response.json();
}

// A 401 here just means "not logged in", which is an expected steady state
// for anonymous visitors, not a failure — return null instead of throwing.
export async function getCurrentUser() {
  let response = await fetch(`${BASE_URL}/auth/me`, {
    credentials: 'include'
  });
  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`Error. Status: ${response.status}`);
  }
  return response.json();
}
