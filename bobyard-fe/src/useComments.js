import { useState, useEffect } from 'react';
import { createComment, getComments } from './api/comments.js';
import { orderComments } from './orderComments.js';

export function useComments() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commentsData, setCommentsData] = useState([]);

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        let results = await getComments();
        let orderedComments = orderComments(results);
        setCommentsData(orderedComments);
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    getData();
  }, []);

  const addComment = async ({ commentInput, setCommentInput }) => {
    let addedComment = await createComment({ text: commentInput, parent: '' });
    setCommentsData([...commentsData, { ...addedComment, depth: 0 }]);
    setCommentInput('');
  };

  return { addComment, commentsData, error, setError, isLoading };
}
