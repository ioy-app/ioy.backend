import getLikesByInstance from "./getLikesByInstance";

/**
 * Get likes counter by comment
 * 
 * @param comment_id - Comment ID
 * @returns
*/
const getLikesByComment = async (comment_id: number): Promise<number> =>
    await getLikesByInstance(comment_id, "comment");

export default getLikesByComment;