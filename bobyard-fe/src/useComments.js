import { useState, useEffect } from 'react';
import { createComment, getComments } from './api/comments.js';

export function useComments() {
    // TODO: Add loading and error states
    const [error, setError] = useState('');
    const [commentsData, setCommentsData] = useState([]);

    useEffect(() => {
        async function getData() {
            try {
                let results = await getComments();
                setCommentsData(results);
            } catch (e) {
                setError(e.message);
            }
        }
        getData();
    }, []);

    const addComment = async ({ commentInput, setCommentInput }) => {
        let addedComment = await createComment({ text: commentInput });
        setCommentsData([...commentsData, addedComment]);
        setCommentInput('');
    };

    return { addComment, commentsData, error, setError };
}
