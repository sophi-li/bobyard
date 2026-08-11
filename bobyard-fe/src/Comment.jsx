import React from 'react';
import anonAvatar from './assets/anonAvatar.png';
import { timeAgo } from './timeAgo.js';

export function CommentContainer({
  comment,
  handleLikeComment,
  isLiking,
  isReplyOpen,
  onToggleReply,
  replyInput,
  onReplyInputChange,
  onReplySubmit,
  isReplying
}) {
  const { author, parent, id, depth, text, likes, replyingTo } = comment;
  let avatar = comment.image !== '' ? comment.image : anonAvatar;
  let time = timeAgo(comment.date);
  let depthPx = `${depth * 30}px`;

  return (
    <div
      className="commentContainer"
      style={{
        marginLeft: depthPx,
        borderLeft: depth > 0 ? '2px solid var(--border)' : 'none',
        paddingLeft: depth > 0 ? '12px' : 0
      }}
    >
      <div className="imgContainer">
        <img
          src={avatar}
          className="avatar"
          alt={`${author}'s avatar`}
          onError={(e) => {
            e.currentTarget.onerror = null; // Prevents infinite loops if fallback also fails
            e.currentTarget.src = anonAvatar;
          }}
        ></img>
      </div>
      <div className="commentBody">
        {depth > 0 && (
          <p className="replyingTo">Replying to @{replyingTo}</p>
        )}
        <div className="headerRow">
          <span>{author}</span>
          <time className="time" dateTime={time}>
            {time}
          </time>
        </div>
        <div className="textContentRow">
          {/* TODO: Clip long text with ellisis & add show more/less button */}
          <p>{text}</p>
        </div>
        <span className="bottomRow">
          {likes}{' '}
          <button
            onClick={() => handleLikeComment({ id })}
            className="likeBtn"
            disabled={isLiking}
          >
            👍
          </button>
          <button onClick={() => onToggleReply(id)} className="replyBtn">
            Reply
          </button>
        </span>
        {isReplyOpen && (
          <form
            className="replyForm"
            onSubmit={(e) => onReplySubmit(e, id)}
          >
            <textarea
              className="replyInput"
              rows="4"
              autoFocus
              value={replyInput}
              placeholder={`Reply to ${author}...`}
              onChange={(e) => onReplyInputChange(e.target.value)}
            />
            <div className="replyFormActions">
              <button
                type="button"
                onClick={() => onToggleReply(id)}
                className="cancelReplyBtn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="replySubmitBtn"
                disabled={isReplying}
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
