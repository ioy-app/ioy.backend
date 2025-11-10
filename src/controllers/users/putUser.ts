import db from "@lib/db";
import CustomError from "../../utils/CustomError.js";
import path from "path";
import fs from "fs";

const work_dir = path.resolve("disk", "users");

export default async function putUser(req, res) {
    try {
        const { login } = req.params;
        
        try {
            for (const [key, value] of Object.entries(req.body.privacy))
                req.body.privacy[key]= Boolean(value == "true");

            const result = await db.query(`
                UPDATE "users"
                SET login=$3, privacy=$4, description=$5
                WHERE id=$1 AND login=$2
            `, [ req.user_id, login, req.body.login, JSON.stringify(req.body.privacy), JSON.stringify(req.body.description) ]);

            if (fs.existsSync(path.join(work_dir, `${login}.png`)))
                fs.renameSync(
                    path.join(work_dir, `${login}.png`),
                    path.join(work_dir, `${req.body.login}.png`)
                );
            if (req.file) {
                
                fs.writeFileSync(path.join(work_dir, `${req.body.login}.png`), req.file.buffer);

            }
            res.status(200).json({
                login: req.body.login
            });
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            

            console.error("[info]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[info]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}