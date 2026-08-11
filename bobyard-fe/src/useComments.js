import { useState, useEffect } from 'react';
import { createComment, getComments } from './api/comments.js';
import { orderComments } from './orderComments.js';

export function useComments() {
  // TODO: Add loading and error states
  const [error, setError] = useState('');
  const [commentsData, setCommentsData] = useState([]);

  useEffect(() => {
    async function getData() {
      try {
        let results = await getComments();
        let orderedComments = orderComments(results);
        setCommentsData(orderedComments);
      } catch (e) {
        setError(e.message);
      }
    }
    getData();
  }, []);

  const addComment = async ({ commentInput, setCommentInput }) => {
    let addedComment = await createComment({ text: commentInput, parent: '' });
    setCommentsData([...commentsData, { ...addedComment, depth: 0 }]);
    setCommentInput('');
  };

  return { addComment, commentsData, error, setError };
}
