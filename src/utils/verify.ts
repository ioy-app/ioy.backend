import jwt from "jsonwebtoken";
import { secret } from "index";

/**
 * Получение данных из токена
 * 
 * @param {string} token Токен
 * @returns {Promise<any>}
*/
const verify = async (token: string): Promise<any> => {
    let data: unknown;
    data = jwt.verify(token, secret);
    return data;
}

export default verify;