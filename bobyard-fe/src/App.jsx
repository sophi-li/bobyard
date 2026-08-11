import { useState, useEffect } from 'react';
import { CommentContainer } from './Comment.jsx';
import { useComments } from './useComments.js';

function App() {
  const [commentInput, setCommentInput] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const {
    addComment,
    addReply,
    commentsData,
    error,
    setError,
    isLoading,
    handleLikeComment,
    likingCommentIds,
    isSubmitting,
    isReplying
  } = useComments();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmitting) return;

    try {
      await addComment({ commentInput, setCommentInput });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleToggleReply = (id) => {
    setReplyingToId((prev) => (prev === id ? null : id));
    setReplyInput('');
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyInput.trim() || isReplying) return;

    try {
      await addReply({ parentId, text: replyInput });
      // Only clear on success so a failed reply stays open for retry.
      setReplyInput('');
      setReplyingToId(null);
    } catch (e) {
      // error already surfaced via setError inside addReply
    }
  };

  return (
    <div className="App">
      <form className="form" onSubmit={(e) => handleSubmit(e)}>
        <label htmlFor="comment">Enter comment:</label>
        <textarea
          className="textInput"
          rows="3"
          id="comment"
          value={commentInput}
          placeholder="Type comment..."
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <button type="submit" className="submitBtn" disabled={isSubmitting}>
          Submit
        </button>
      </form>
      {error && <p>{error}</p>}
      {isLoading && <p>Loading comments...</p>}

      {commentsData.length !== 0 &&
        commentsData.map((comment) => {
          return (
            <CommentContainer
              comment={comment}
              key={comment.id}
              handleLikeComment={handleLikeComment}
              isLiking={likingCommentIds.has(comment.id)}
              isReplyOpen={replyingToId === comment.id}
              onToggleReply={handleToggleReply}
              replyInput={replyInput}
              onReplyInputChange={setReplyInput}
              onReplySubmit={handleReplySubmit}
              isReplying={isReplying}
            />
          );
        })}
    </div>
  );
}

export default App;
