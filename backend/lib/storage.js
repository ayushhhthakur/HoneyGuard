import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;

let s3 = null;

if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET) {
  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
} else {
  console.warn(
    '[storage] R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET not fully set — ' +
      'image-category honeytoken uploads will fail until backend/.env is configured.'
  );
}

/**
 * Upload an in-memory file buffer (from multer) to the R2 bucket and return
 * its public URL + object key.
 *
 * R2_PUBLIC_URL should be either the bucket's public dev subdomain
 * (https://pub-xxxx.r2.dev) or a custom domain you've mapped to the bucket
 * via Cloudflare. R2 objects are private by default, so one of those has to
 * be configured for generated image URLs to actually resolve.
 */
export const uploadHoneytokenImage = async (file) => {
  if (!s3) {
    throw new Error('R2 storage is not configured (see backend/.env.example)');
  }

  const ext = (file.originalname.split('.').pop() || 'bin').toLowerCase();
  const key = `honeytoken-images/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const imageurl = `${R2_PUBLIC_URL?.replace(/\/$/, '')}/${key}`;
  return { imageurl, imagepath: key };
};

export const deleteHoneytokenImage = async (key) => {
  if (!s3 || !key) return;
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch (err) {
    console.warn('[storage] Failed to delete R2 object', key, err.message);
  }
};

export const isStorageConfigured = () => Boolean(s3 && R2_PUBLIC_URL);
