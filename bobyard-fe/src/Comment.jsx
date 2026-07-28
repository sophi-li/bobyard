import React from "react"
import anonAvatar from './assets/anonAvatar.png'
import { timeAgo } from './timeAgo.js'


export function CommentContainer({ comment }) {
    const { author } = comment
    // TODO: Validate avatar url is successful
    let avatar = comment.image !== "" ? comment.image : anonAvatar
    let time = timeAgo(comment.date)
    return (
        <div className="commentContainer">
            <div className="imgContainer">
                <img src={avatar} className="avatar" alt={`${author}'s avatar`}></img>
            </div>
            <div className="commentBody">
                <div className="headerRow">
                    <span>{comment.author}</span>
                    <time
                        className="time"
                        dateTime={time}>{time}
                    </time>
                </div>
                <div className="textContentRow">
                    {/* TODO: Clip long text with ellisis & add show more/less button */}
                    <p>{comment.text}</p>
                </div>
                <span className="bottomRow">
                    {/* TODO: Add like update */}
                    {comment.likes} <button className="likeBtn">👍</button>
                </span>
            </div>
        </div>
    )
}