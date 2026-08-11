export const orderComments = (comments) => {
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
  const addComment = (comment, depth, replyingTo) => {
    sortedComments.push({ ...comment, depth, replyingTo });

    let children = groupedChildrenByParentId[comment.id];
    if (children !== undefined) {
      for (let k = 0; k < children.length; k++) {
        // grandchildren
        addComment(children[k], depth + 1, comment.author);
      }
    }
  };

  // start with top level parents
  let topLevelParents = groupedChildrenByParentId[''];
  if (topLevelParents !== undefined) {
    for (let j = 0; j < topLevelParents.length; j++) {
      addComment(topLevelParents[j], 0, null);
    }
  }

  return sortedComments;
};
