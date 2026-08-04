import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { createLogger } from '../core/logger.js';
import { AppError } from '../core/errors.js';

const log = createLogger('StorageService');

let s3 = null;
if (env.r2.isConfigured) {
  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.r2.accessKeyId, secretAccessKey: env.r2.secretAccessKey },
  });
} else {
  log.warn('R2 storage is not fully configured — image-category honeytoken uploads will fail until backend/.env is set.');
}

const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf', 'docx', 'xlsx', 'pptx', 'html']);

/**
 * Upload any generated or user-provided file buffer to the R2 bucket and
 * return its public URL + object key. Used for image uploads AND for
 * server-generated honeydocuments (PDF/Word/Excel/PowerPoint/HTML).
 */
export const uploadHoneytokenFile = async ({ buffer, mimetype, originalname }, { folder = 'honeytoken-files' } = {}) => {
  if (!s3) {
    throw new AppError('File storage is not configured on this server', 503, 'STORAGE_NOT_CONFIGURED');
  }

  const rawExt = (originalname.split('.').pop() || 'bin').toLowerCase();
  const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : 'bin';
  const key = `${folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;

  await s3.send(new PutObjectCommand({ Bucket: env.r2.bucket, Key: key, Body: buffer, ContentType: mimetype }));

  const fileurl = `${env.r2.publicUrl?.replace(/\/$/, '')}/${key}`;
  return { fileurl, filepath: key };
};

/**
 * Upload an in-memory file buffer (from multer) to the R2 bucket and return
 * its public URL + object key.
 */
export const uploadHoneytokenImage = async (file) => {
  const { fileurl, filepath } = await uploadHoneytokenFile(
    { buffer: file.buffer, mimetype: file.mimetype, originalname: file.originalname },
    { folder: 'honeytoken-images' }
  );
  return { imageurl: fileurl, imagepath: filepath };
};

export const deleteHoneytokenImage = async (key) => {
  if (!s3 || !key) return;
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: env.r2.bucket, Key: key }));
  } catch (err) {
    log.warn({ key, err: err.message }, 'Failed to delete R2 object');
  }
};

export const isStorageConfigured = () => Boolean(s3 && env.r2.publicUrl);
