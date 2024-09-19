import { Upload } from '@aws-sdk/lib-storage';
import crypto from 'crypto';
import s3 from './s3Config';
import mime from 'mime-types';
import config from '../config/config';
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


// Generates a random image name with optional bytes length
const randomImageName = (bytes: number = 32): string => crypto.randomBytes(bytes).toString('hex');

// Uploads a file to S3 and returns the image name
export async function uploadFileToS3(fileBuffer: Buffer, originalname: string): Promise<string> {
    const imageName = randomImageName();
    const extension = originalname.split('.').pop() || '';
    const contentType = mime.lookup(extension) || 'application/octet-stream';
    console.log('11')
    // Ensure the file buffer is valid
    if (!(fileBuffer instanceof Buffer)) {
        console.error('fileBuffer is not a Buffer:', fileBuffer);
        throw new Error('File buffer is not a Buffer.');
    }
    console.log('12')
    const upload = new Upload({
        client: s3,
        params: {
            Bucket: config.bucketName,
            Key: imageName,
            Body: fileBuffer,
            ContentType: contentType,
        },
    });
    console.log('123')
    try {
        await upload.done();
        return imageName;
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        throw err;
    }
}


export async function fetchFileFromS3(key: string, expiresIn = 604800): Promise<string> {
    try {
        
        const command = new GetObjectCommand({
            Bucket: config.bucketName,
            Key: key,
        });
        const url = await getSignedUrl(s3, command, { expiresIn }); 
        
        return url;
    } catch (error) {
        console.error("Error fetching file from S3:", error);
        throw error;
    }
}