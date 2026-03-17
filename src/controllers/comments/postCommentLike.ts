import { checkLikeByComment } from "@/services/likes";
import createLike from "@/services/likes/createLike";
import deleteLike from "@/services/likes/deleteLike";
import Request from "@/types/request";
import { Response } from "express";

const postCommentLike = async (req: Request, res: Response): Promise<void> => {
    const { commentid } = req.params;
    
    const is_like = await checkLikeByComment(Number(req.user_id), Number(commentid));
    
    let status: string;
    if (is_like) {
        await deleteLike(Number(req.user_id), Number(commentid), "comment");
        status = "dislike";
    } else {
        await createLike(Number(req.user_id), Number(commentid), "comment");
        status = "liked";
    }
    
    res.status(200).json({ status });
}

export default postCommentLike;