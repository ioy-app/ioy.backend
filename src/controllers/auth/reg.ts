import kafka from "@/lib/kafka";
import createUser from "@services/users/createUser";
import { Request, Response } from "express";

const producer = kafka.producer();

/**
 * Registry new user
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Reg = async (req: Request, res: Response): Promise<void> => {
    const { login, email } = req.body;
    await createUser(login, email);
    
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
                    login,
                    props: {
                        login,
                        email,
                        code: ''
                    }
                })
            }
        ]
    });
    await producer.disconnect();

    res.status(200).end();
}

export default Reg;