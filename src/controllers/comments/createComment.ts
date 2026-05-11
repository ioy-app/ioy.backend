import Request from "@/types/request";
import { Response } from "express";
import createCommentService from "@/services/comments/createComment";

/**
 * Create or reply comment
 * 
 * @param req - Request
 * @param res - Response
*/
const createComment = async (req: Request, res: Response): Promise<void> => {
    const { gameid, commentid } = req.params;
    const isComment = typeof(commentid) != "undefined";
    const type = req?.body?.type || "game";
    const response = await createCommentService(
        Number(isComment ? commentid : gameid),
        req.user_id,
        req.body.comment,
        isComment ? "comment" : type
    );

    res.status(200).json(response);
}

export default createComment;