import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { supabaseAdmin } from '../lib/supabase';
import { config } from '../config/config';

function validateImage(mimetype: string, size: number): string | null {
  if (!config.allowedImageTypes.includes(mimetype)) {
    return 'File must be a valid image (JPEG, PNG, WebP)';
  }
  if (size > config.maxFileSize) {
    return 'File must be under 5MB';
  }
  return null;
}

export async function uploadProductImageService(
  userId: string,
  file: Express.Multer.File
) {
  const validationError = validateImage(file.mimetype, file.size);
  if (validationError) {
    return { success: false, message: 'Invalid image file', errors: { file: validationError } };
  }

  let contents: Buffer = file.buffer;

  // Resize using sharp (replaces Pillow)
  try {
    contents = await sharp(contents)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch { /* use original if resize fails */ }

  const ext = file.originalname?.split('.').pop() ?? 'jpg';
  const filename = `products/${userId}/${uuidv4()}.${ext}`;

  try {
    const storage = supabaseAdmin.storage.from('products');
    await storage.upload(filename, contents, {
      contentType: file.mimetype,
      upsert: true,
    });

    const { data: urlData } = storage.getPublicUrl(filename);
    return { success: true, message: 'Image uploaded successfully', data: { url: urlData.publicUrl } };
  } catch (err) {
    console.error('Storage upload failed:', err);
    return { success: false, message: `Failed to upload to storage: ${err}`, errors: { storage: String(err) } };
  }
}

export async function uploadProfileImageService(
  userId: string,
  file: Express.Multer.File
) {
  const validationError = validateImage(file.mimetype, file.size);
  if (validationError) {
    return { success: false, message: 'Invalid image file', errors: { file: validationError } };
  }

  let contents: Buffer = file.buffer;

  // Square crop + resize using sharp
  try {
    const meta = await sharp(contents).metadata();
    const w = meta.width ?? 400;
    const h = meta.height ?? 400;
    const side = Math.min(w, h);
    const left = Math.floor((w - side) / 2);
    const top = Math.floor((h - side) / 2);

    contents = await sharp(contents)
      .extract({ left, top, width: side, height: side })
      .resize(400, 400)
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch { /* use original */ }

  const filename = `profiles/${userId}/${uuidv4()}.jpg`;

  try {
    const storage = supabaseAdmin.storage.from('profiles');
    await storage.upload(filename, contents, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    const { data: urlData } = storage.getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    // Update user profile
    await supabaseAdmin
      .from('users')
      .update({ profile_image_url: publicUrl })
      .eq('id', userId);

    return { success: true, message: 'Profile image uploaded successfully', data: { url: publicUrl } };
  } catch (err) {
    console.error('Storage upload failed:', err);
    return { success: false, message: `Failed to upload to storage: ${err}`, errors: { storage: String(err) } };
  }
}
