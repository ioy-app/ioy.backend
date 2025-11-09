import jwt from "jsonwebtoken";
import { secret } from "index";

const verify = async (token: string): Promise<any> => {
    let data;
    data = jwt.verify(token, secret);
    return data;
}

export default verify;