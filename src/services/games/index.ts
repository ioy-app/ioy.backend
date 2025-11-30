import getGameById from "./getGameById";
import getGameFile from "./getGameFile";
import getGamesRecommendsByGame from "./getGamesRecommendsByGame";
import jobGamesSearch from "./jobGamesSearch";
import createGame from "./createGame";
import getGamesByUser from "./getGamesByUser";
import putGameFile from "./putGameFile";
import z from "zod";

export const validObj = z.object({
    user_id: z.number({ error: "errors.invalid.id" })
        .nonnegative({ error: "errors.invalid.id" })
        .nonoptional({ error: "errors.required.id" }),
    offset: z.number({ error: "errors.invalid.offset" })
        .nonnegative({ error: "errors.invalid.offset" })
        .optional(),
    limit: z.number({ error: "erros.invlaid.limit" })
        .nonnegative({ error: "errors.invalid.limit" })
        .optional()
});

export {
    getGameById,
    getGameFile,
    getGamesRecommendsByGame,
    jobGamesSearch,
    createGame,
    getGamesByUser,
    putGameFile
}