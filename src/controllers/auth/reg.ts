import kafka from "@/lib/kafka";
import createUser from "@services/users/createUser";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const producer = kafka.producer();

/**
 * Registry new user
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Reg = async (req: Request, res: Response): Promise<void> => {
    const { login, email } = req.body;
    const id = await createUser(login, email);

    const verify_code = jwt.sign({
        id,
        login
    }, process.env.SECRET, {
        expiresIn: "3d"
    });
    
    await producer.connect();
    await producer.send({
        topic: "notify",
        messages: [
            {
                key: `${login}:${email}`,
                value: JSON.stringify({
                    type: "reg",
                    subject: `Welcome, ${login}!`,
                    email,
                    props: {
                        login,
                        email,
                        verify_code
                    }
                })
            }
        ]
    });
    await producer.disconnect();

    res.status(200).end();
}

export default Reg;