import { useState, useEffect, useRef } from 'react';
import { createComment, getComments, likeComment } from './api/comments.js';
import { orderComments } from './orderComments.js';

const POLL_INTERVAL_MS = 4000;

const replaceCommentById = (comments, id, patch) =>
  comments.map((c) => (c.id === id ? { ...c, ...patch } : c));

// A cheap signature of the fields polling cares about, so we can skip
// re-rendering when a poll comes back with nothing new.
const rawSignature = (comments) =>
  JSON.stringify(comments.map((c) => [c.id, c.parent, c.text, c.likes]));

// Merges a fresh fetch into current state, but for any comment currently
// being liked/replied to in this tab, keeps the local (optimistic) version
// instead of the polled one so an in-flight action doesn't get clobbered.
const reconcileComments = (current, fresh, pendingIds) => {
  const currentById = new Map(current.map((c) => [c.id, c]));
  const merged = fresh.map((f) =>
    pendingIds.has(f.id) && currentById.has(f.id) ? currentById.get(f.id) : f
  );
  return orderComments(merged);
};

export function useComments() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commentsData, setCommentsData] = useState([]);
  const [likingCommentIds, setLikingCommentIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyPendingIds, setReplyPendingIds] = useState(new Set());
  const lastPollSignatureRef = useRef(null);

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        let results = await getComments();
        lastPollSignatureRef.current = rawSignature(results);
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

  useEffect(() => {
    const poll = async () => {
      // Skip while backgrounded; no point polling a tab no one's looking at.
      if (document.hidden) return;

      try {
        let fresh = await getComments();
        let signature = rawSignature(fresh);
        if (signature === lastPollSignatureRef.current) return;
        lastPollSignatureRef.current = signature;

        let pendingIds = new Set([...likingCommentIds, ...replyPendingIds]);
        setCommentsData((prev) => reconcileComments(prev, fresh, pendingIds));
      } catch (e) {
        // Silent: a transient poll failure shouldn't surface as a
        // user-facing error the way a failed action does.
      }
    };

    let intervalId = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [likingCommentIds, replyPendingIds]);

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
    // Marks the parent as pending so a poll mid-request doesn't briefly
    // show the list without this reply before the response lands.
    setReplyPendingIds((prev) => new Set(prev).add(parentId));
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
      setReplyPendingIds((prev) => {
        let next = new Set(prev);
        next.delete(parentId);
        return next;
      });
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
