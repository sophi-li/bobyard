import { useState } from 'react'
import { CommentContainer } from './Comment.jsx'
import { useEffect } from 'react'
import { createComment, getComments } from "./api/comments.js"

function App() {
  // TODO: Add loading and error states
  const [error, setError] = useState("")
  const [commentsData, setCommentsData] = useState([])
  const [commentInput, setCommentInput] = useState("")


  useEffect(() => {
    async function getData() {
      try {
        let results = await getComments()
        setCommentsData(results)
      } catch (e) {
        setError(e.message)
      }
    }
    getData()
  }, [])

  const addComment = async (e) => {
    e.preventDefault()
    if (!commentInput.trim()) return;

    try {
      let addedComment = await createComment({ text: commentInput })
      setCommentsData([...commentsData, addedComment])
      setCommentInput("")
    } catch (e) {
      setCommentInput(e.message)
    }
  }

  return (
    <div className='App'>
      <form className='form' onSubmit={(e) => addComment(e)}>
        {/* TODO: Add loading & error state */}
        <label for="comment">Enter comment:</label>
        <textarea
          className='textInput'
          rows="3"
          id="comment"
          value={commentInput}
          placeholder="Type comment..."
          onChange={(e) => setCommentInput(e.target.value)} />
        <button type='submit' className='submitBtn'>Submit</button>
      </form>

      {commentsData.length !== 0 && commentsData.map((comment) => {
        return (
          <CommentContainer comment={comment} key={comment.id} />
        )
      })}
    </div>
  )
}

export default App
