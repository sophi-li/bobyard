import { useState, useEffect } from 'react';
import { createComment, getComments, likeComment } from './api/comments.js';
import { orderComments } from './orderComments.js';

const replaceCommentById = (comments, id, patch) =>
  comments.map((c) => (c.id === id ? { ...c, ...patch } : c));

export function useComments() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commentsData, setCommentsData] = useState([]);
  const [likingCommentIds, setLikingCommentIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

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
    // Blocks a second submit from firing before the disabled button re-renders.
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let addedComment = await createComment({
        text: commentInput,
        parent: ''
      });
      setCommentsData((prev) => [...prev, { ...addedComment, depth: 0 }]);
      setCommentInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addReply = async ({ parentId, text }) => {
    // Blocks a second submit from firing before the disabled button re-renders.
    if (isReplying) return;

    setIsReplying(true);
    try {
      let addedComment = await createComment({ text, parent: parentId });
      // Re-running orderComments (instead of appending with a guessed depth)
      // slots the reply under its parent and recomputes replyingTo for it,
      // so it shows up correctly without a refetch.
      setCommentsData((prev) => orderComments([...prev, addedComment]));
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setIsReplying(false);
    }
  };

  const handleLikeComment = async ({ id }) => {
    // Blocks a second click from firing before the disabled button re-renders.
    if (likingCommentIds.has(id)) return;

    let comment = commentsData.find((c) => c.id === id);
    if (!comment) return;

    setLikingCommentIds((prev) => new Set(prev).add(id));
    try {
      let likedComment = await likeComment({ id, likes: comment.likes + 1 });
      // Avoids clobbering a like on another comment that resolved in between this request's start and finish.
      setCommentsData((prev) => replaceCommentById(prev, id, likedComment));
    } catch (e) {
      setError(e.message);
    } finally {
      setLikingCommentIds((prev) => {
        let next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return {
    addComment,
    addReply,
    handleLikeComment,
    commentsData,
    error,
    setError,
    isLoading,
    likingCommentIds,
    isSubmitting,
    isReplying
  };
}
