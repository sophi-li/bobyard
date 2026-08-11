import { useState, useEffect } from 'react';
import { createComment, getComments } from './api/comments.js';

const orderComments = (comments) => {
  let groupedChildrenByParentId = {};

  // group all the children by parentId
  for (let i = 0; i < comments.length; i++) {
    let currComment = comments[i];
    let parentId = currComment.parent;
    if (groupedChildrenByParentId[parentId] === undefined) {
      groupedChildrenByParentId[parentId] = [];
    }
    groupedChildrenByParentId[parentId].push(currComment);
  }

  let sortedComments = [];

  // keep adding children
  const addComment = (comment, depth) => {
    sortedComments.push({ ...comment, depth });

    let children = groupedChildrenByParentId[comment.id];
    if (children !== undefined) {
      for (let k = 0; k < children.length; k++) {
        // grandchildren
        addComment(children[k], depth + 1);
      }
    }
  };

  // start with top level parents
  let topLevelParents = groupedChildrenByParentId[''];
  if (topLevelParents !== undefined) {
    for (let j = 0; j < topLevelParents.length; j++) {
      addComment(topLevelParents[j], 0);
    }
  }

  return sortedComments;
};

export function useComments() {
  // TODO: Add loading and error states
  const [error, setError] = useState('');
  const [commentsData, setCommentsData] = useState([]);

  useEffect(() => {
    async function getData() {
      try {
        let results = await getComments();
        let orderedComments = orderComments(results);
        setCommentsData(orderedComments);
      } catch (e) {
        setError(e.message);
      }
    }
    getData();
  }, []);

  const addComment = async ({ commentInput, setCommentInput }) => {
    let addedComment = await createComment({ text: commentInput, parent: '' });
    setCommentsData([...commentsData, { ...addedComment, depth: 0 }]);
    setCommentInput('');
  };

  return { addComment, commentsData, error, setError };
}
