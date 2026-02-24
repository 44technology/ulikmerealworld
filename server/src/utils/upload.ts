import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const storage = multer.memoryStorage();

const imageTypes = /jpeg|jpg|png|gif|webp/;
const videoTypes = /mp4|webm|mov|m4v/;

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase().split('.').pop() || '';
    const imageOk = imageTypes.test(ext) && imageTypes.test(file.mimetype);
    if (imageOk) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

/** For post creation: allows image or video, larger size limit */
export const uploadPost = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for video
  },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase().split('.').pop() || '';
    const imageOk = imageTypes.test(ext) && imageTypes.test(file.mimetype);
    const videoOk = videoTypes.test(ext) || /^video\//.test(file.mimetype);
    if (imageOk || videoOk) return cb(null, true);
    cb(new Error('Only image or video files are allowed'));
  },
});

export const uploadToCloudinary = async (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      reject(new Error('File buffer is missing'));
      return;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing. Check your .env file.');
      reject(new Error('Cloudinary configuration is missing. Please check your environment variables.'));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ulikme',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error details:', {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
          });
          reject(error);
        } else if (!result || !result.secure_url) {
          reject(new Error('Upload succeeded but no URL returned'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

const isVideoMime = (mimetype: string) => /^video\//.test(mimetype);

/** Upload image or video for posts; returns URL (stored in post.image). */
export const uploadToCloudinaryForPost = async (
  file: Express.Multer.File
): Promise<string> => {
  if (!file || !file.buffer) {
    throw new Error('File buffer is missing');
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
  }

  if (isVideoMime(file.mimetype)) {
    const b64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${b64}`;
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          resource_type: 'video',
          folder: 'ulikme',
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary video upload error:', error);
            reject(error);
          } else if (!result || !result.secure_url) {
            reject(new Error('Upload succeeded but no URL returned'));
          } else {
            resolve(result.secure_url);
          }
        }
      );
    });
  }

  return uploadToCloudinary(file);
};
