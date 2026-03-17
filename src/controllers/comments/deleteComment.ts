import { getComment } from "@/services/comments";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import { Response } from "express";
import deleteCommentService from "@/services/comments/deleteComment";
import ContentError from "@/utils/ContentError";

const deleteComment = async (req: Request, res: Response): Promise<void> => {
    const { gameid, commentid } = req.params;

    const comment = await getComment(Number(commentid));
    if (comment.source_id != req.user_id)
        throw new AccessError("deleteComment", "errors.denied");

    const is_deleted = await deleteCommentService(Number(gameid), Number(commentid));
    if (!is_deleted)
        throw new ContentError("deleteComment", "errors.denied");

    res.status(200).json({
        status: "deleted"
    });
}

export default deleteComment;