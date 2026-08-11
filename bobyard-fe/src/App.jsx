import { useState, useEffect } from 'react';
import { CommentContainer } from './Comment.jsx';
import { useComments } from './useComments.js';

function App() {
  const [commentInput, setCommentInput] = useState('');
  const {
    addComment,
    commentsData,
    error,
    setError,
    isLoading,
    handleLikeComment,
    likingCommentIds,
    isSubmitting
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
            />
          );
        })}
    </div>
  );
}

export default App;
