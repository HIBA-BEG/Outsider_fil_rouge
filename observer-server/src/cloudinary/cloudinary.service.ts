import { Injectable } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse, v2 as cloudinary, v2 } from 'cloudinary';
import { Readable } from 'stream';
import toStream from 'buffer-to-stream';


@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed - no result returned'));
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }
}