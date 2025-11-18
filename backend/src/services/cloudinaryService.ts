import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  /**
   * Upload base64 image to Cloudinary
   * @param base64Image - Base64 encoded image string (with or without data URI prefix)
   * @param folder - Cloudinary folder name (default: 'potholes')
   * @returns Secure URL of uploaded image
   */
  static async uploadImage(
    base64Image: string,
    folder = 'potholes'
  ): Promise<string> {
    try {
      // Ensure base64 has proper data URI format
      const base64Data = base64Image.startsWith('data:')
        ? base64Image
        : `data:image/jpeg;base64,${base64Image}`;

      const result = await cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // Limit max size
          { quality: 'auto' }, // Auto quality optimization
        ],
      });

      return result.secure_url;
    } catch (error: any) {
      console.error('L Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary: ' + error.message);
    }
  }

  /**
   * Delete image from Cloudinary by public ID
   * @param publicId - Cloudinary public ID (extracted from URL)
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      console.error('L Cloudinary delete error:', error);
      throw new Error('Failed to delete image from Cloudinary: ' + error.message);
    }
  }
}
