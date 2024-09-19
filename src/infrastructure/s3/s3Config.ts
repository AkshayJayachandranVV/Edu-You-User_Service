import {S3Client} from '@aws-sdk/client-s3';
import config from '../config/config';

if(!config.bucket_Access_Key || !config.bucketAccessPassword || !config.bucketRegion){
    throw new Error('S3 configuration is missing');
}

const s3 = new S3Client({
    credentials:{
        accessKeyId:config.bucket_Access_Key,
        secretAccessKey:config.bucketAccessPassword
    },
    region:config.bucketRegion
})

export default s3;