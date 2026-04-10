import { getGameById } from "@/services/games";
import { getJam } from "@/services/jams";
import { checkSubscribe } from "@/services/subscribers";
import { createVote, getVote } from "@/services/votes";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import { Response } from "express";

/**
 * Put vote by game on jam
 * @param req - Request
 * @param res - Response
*/
const putVote = async(req: Request, res: Response): Promise<void> => {
  const game_id = Number(req?.params?.id);
  const gamedata = await getGameById(game_id);

  if (!gamedata?.jam_id)
    throw new ContentError("putVote", "errors.no_include_jam");

  const jamdata = await getJam(gamedata?.jam_id);
  if (jamdata?.status != "voting")
    throw new AccessError("putVote", "errors.denied");

  switch(jamdata?.vote_type) {
    case "judges": {
      if (!jamdata?.judges?.includes(req.user_id))
        throw new AccessError("putVote", "errors.denied");
    } break;
    case "members": {
      const isMember = await checkSubscribe(req.user_id, gamedata?.jam_id, "jam");
      if (!isMember)
        throw new AccessError("putVote", "errors.denied");
    } break;
  }

  const id = await createVote(
    req.user_id,
    gamedata?.jam_id,
    game_id,
    req.body.nomination,
    req.body.score
  );

  if (!id)
    throw new ContentError("putVote", "errors.denied");

  const data = await getVote(id);
  res.status(200).json(data);
}

export default putVote;