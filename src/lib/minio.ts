import { Client } from "minio";
import dotenv from "dotenv";

dotenv.config();

const minio = new Client({
    endPoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});



minio.checkFileExists = async (bucketName: string, object: string): Promise<boolean> => {
    try {
        await minio.statObject(bucketName, object);
    }
    catch(err) { return false; }
    return true;
}



export default minio;