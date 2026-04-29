import checkLikeByInstance from "./checkLikeByInstance";

/**
 * Check has like by comment
 * 
 * @param user_id - User ID
 * @param comment_id - Comment ID
 * @returns
*/
const checkLikeByComment = async (
    user_id: number,
    comment_id: number
): Promise<boolean> =>
    await checkLikeByInstance(user_id, comment_id, "comment");

export default checkLikeByComment;