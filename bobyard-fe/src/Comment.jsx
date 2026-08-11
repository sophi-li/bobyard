import React from 'react';
import anonAvatar from './assets/anonAvatar.png';
import { timeAgo } from './timeAgo.js';
import { useComments } from './useComments.js';

export function CommentContainer({ comment, handleLikeComment }) {
  const { author, parent, id, depth, text, likes } = comment;
  let avatar = comment.image !== '' ? comment.image : anonAvatar;
  let time = timeAgo(comment.date);
  let depthPx = `${depth * 30}px`;

  return (
    <div className="commentContainer" style={{ marginLeft: depthPx }}>
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
          {/* TODO: Add like update */}
          {likes}{' '}
          <button onClick={() => handleLikeComment({ id })} className="likeBtn">
            👍
          </button>
        </span>
      </div>
    </div>
  );
}
