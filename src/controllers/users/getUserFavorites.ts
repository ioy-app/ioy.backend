import getUserFavoritesService from "@services/users/getUserFavorites";
import { Request, Response } from "express";

/**
 * Получение списка избранных
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getUserFavorites = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;
    
    const data = await getUserFavoritesService(login, req.query);
    res.status(200).json(data);
}

export default getUserFavorites;