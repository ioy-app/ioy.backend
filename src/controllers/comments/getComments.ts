import { Response } from "express";
import { getComment, getComments as getCommentsService } from "@/services/comments";
import getUser from "@/services/users/getUser";
import getUserLogin from "@/services/users/getUserLogin";
import { checkLikeByComment, getLikesByComment } from "@/services/likes";
import verify from "@/utils/verify";
import Request from "@/types/request";

/**
 * Get comment data to client
 * 
 * @param id - Comment ID
 * @param req - Request
 * @returns 
*/
const funcComment = async (id: number, req: Request) => {
    const comment = await getComment(id);
    const answers = [];
    const [ result, answers_total ] = await getCommentsService(
        Number(id),
        0,
        2,
        "comment"
    );

    if (answers_total > 0) {
        for (const aid of result) {
            const answer = await funcComment(aid, req);
            answers.push(answer);
        }
    }

    if (comment.deleted) {
        return {
            id,
            deleted: true,
            answers,
            answers_total
        };
    }

    const login = await getUserLogin(comment.source_id);
    const author = await getUser(login);
    const likes = await getLikesByComment(id);

    let is_like: boolean;
    let is_me: boolean;
    
    if (req.token) {
        const { id: user_id } = await verify(req.token);
        is_like = await checkLikeByComment(Number(user_id), id);
        is_me = user_id == comment.source_id;
    }
    
    
    

    return {
        ...comment,
        author,
        answers,
        answers_total,
        likes,
        is_like,
        is_me
    };
}

/**
 * Get comments
 * 
 * @param req - Request
 * @param res - Response
 */
const getComments = async (req: Request, res: Response): Promise<void> => {
    const { gameid, commentid } = req.params;
    const isComment = typeof(commentid) != "undefined";
    const offset: number = req.query.offset && Number(req.query.offset);
    const limit: number = req.query.limit && Number(req.query.limit);
    const type: "game" | "picture" = req?.query?.type || "game";
    const sort: "new" | "old" = (req.query.sort && req.query.sort) as ("new" | "old");

    const [ comments, total ] = await getCommentsService(
        Number(isComment ? commentid : gameid),
        offset,
        limit,
        isComment ? "comment" : type,
        sort
    );

    const items = [];
    for (const id of comments) {
        const comment = await funcComment(id, req);
        items.push(comment);
    }

    res.status(200).json({
        items,
        total,
        offset,
        limit
    });
}

export default getComments;