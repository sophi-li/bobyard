const BASE_URL = 'http://localhost:3001';
const ADMIN_USER = 'Admin';

export async function getComments() {
    try {
        let response = await fetch(`${BASE_URL}/comments`);
        if (!response.ok) {
            throw new Error(`Error. Status: ${response.status}`);
        }

        let results = await response.json();
        return results;
    } catch (e) {
        setError(e.message);
    }
}

export async function createComment({ text }) {
    try {
        let response = await fetch('http://localhost:3001/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, author: ADMIN_USER })
        });
        if (!response.ok) {
            throw new Error(`Error. Status: ${response.status}`);
        }
        const addedComment = await response.json();
        return addedComment;
    } catch (e) {}
}
