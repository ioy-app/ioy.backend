import minio from "@/lib/minio";

/**
 * Delete file from minio
 * 
 * @param bucket - Bucket name
 * @param filename - File name
 * @returns
*/
const deleteFile = async (bucket: string, filename: string): Promise<boolean> => {
	const exists = await minio.checkFileExists(bucket, filename);
	if (!exists)
		return false;

	await minio.removeObject(bucket, filename);
	return true;
}

export default deleteFile;
