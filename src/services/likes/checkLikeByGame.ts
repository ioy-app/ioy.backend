import checkLikeByInstance from "./checkLikeByInstance";

/**
 * Check has like by game
 * 
 * @param user_id - User ID
 * @param game_id - Game ID
 * @returns
*/
const checkLikeByGame = async (
    user_id: number,
    game_id: number
): Promise<boolean> =>
    await checkLikeByInstance(user_id, game_id, "game");

export default checkLikeByGame;