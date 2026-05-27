import { Client } from "minio";
import dotenv from "dotenv";
import logger from "@/lib/logger";

dotenv.config();

interface MinioClient extends Client {
    /**
     * Check exists file
     * @param bucket - Bucket
     * @param object - Object name
     * 
     * @example
     * await minio.checkFileExists("images", "filename.txt"); // false
     * await minio.checkFileExists("images", "filename.png"); // true
     * 
     * @returns
    */
    checkFileExists: (bucket: string, object: string) => Promise<boolean>;

    /**
     * Create no exists bucket
     * @param bucket - Bucket
     * 
     * @example
     * await minio.ensureBucket("image"); // Create bucket with name "image"
     * await minio.ensureBucket("image"); // Void (Bucket "image" exists)
     * 
     * @returns 
    */
    ensureBucket: (bucket: string) => Promise<void>;
}

const minio = new Client({
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "",
    secretKey: process.env.MINIO_SECRET_KEY || ""
}) as MinioClient;

minio.checkFileExists = async (bucket, object): Promise<boolean> => {
    try {
        await minio.statObject(bucket, object);
        return true;
    }
    catch(err: any) {
        if (["NotFound", "NoSuchKey"].includes(err?.code))
            return false;

        logger.error("Minio statObject failed", {
            bucket,
            object,
            error: err?.message
        });
        throw err;
    }
}

minio.ensureBucket = async (bucket): Promise<void> => {
    try {
        const exists = await minio.bucketExists(bucket);
        if (!exists) {
            await minio.makeBucket(bucket);
            logger.info("Minio bucket created", { bucket });
        }
    }
    catch(err: any) {
        logger.error("Minio ensure bucket failed", {
            bucket,
            error: err?.message
        });
        throw err;
    }
}

/**
 * Check minio connection
 * @returns 
*/
export const initMinio = async (): Promise<boolean> => {
    try {
        const buckets = await minio.listBuckets();
        logger.info("Minio connected", { buckets: buckets.length });
        return true;
    }
    catch(err: any) {
        logger.error("Minio connection failed", { error: err?.message });
        return false;
    }
}

Object.freeze(minio);
export default minio;