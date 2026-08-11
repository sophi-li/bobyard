import { useState, useEffect } from 'react';
import { CommentContainer } from './Comment.jsx';
import { useComments } from './useComments.js';

function App() {
  const [commentInput, setCommentInput] = useState('');
  const { addComment, commentsData, error, setError } = useComments();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      await addComment({ commentInput, setCommentInput });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="App">
      <form className="form" onSubmit={(e) => handleSubmit(e)}>
        {/* TODO: Add loading & error state */}
        <label htmlFor="comment">Enter comment:</label>
        <textarea
          className="textInput"
          rows="3"
          id="comment"
          value={commentInput}
          placeholder="Type comment..."
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <button type="submit" className="submitBtn">
          Submit
        </button>
      </form>

      {commentsData.length !== 0 &&
        commentsData.map((comment) => {
          return <CommentContainer comment={comment} key={comment.id} />;
        })}
    </div>
  );
}

export default App;
