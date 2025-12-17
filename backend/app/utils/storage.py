from flask import current_app
from werkzeug.utils import secure_filename
from app.database import get_supabase
import os
import uuid
from PIL import Image
from io import BytesIO


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def optimize_image(image_file, max_size=(800, 800), quality=85) -> BytesIO:
    """Optimize image size and quality"""
    img = Image.open(image_file)
    
    # Convert RGBA to RGB if necessary
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    
    # Resize if larger than max_size
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    # Save to BytesIO
    output = BytesIO()
    img.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    
    return output


def upload_to_supabase(file, bucket: str, folder: str = '') -> str:
    """Upload file to Supabase Storage"""
    try:
        supabase = get_supabase()
        if not supabase:
            raise Exception("Supabase client not initialized")
        
        # Generate unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        
        if folder:
            filepath = f"{folder}/{filename}"
        else:
            filepath = filename
        
        # Optimize image if it's an image file
        if ext in ['jpg', 'jpeg', 'png', 'webp']:
            optimized = optimize_image(file)
            file_data = optimized.read()
        else:
            file_data = file.read()
        
        # Upload to Supabase Storage
        response = supabase.storage.from_(bucket).upload(
            filepath,
            file_data,
            file_options={"content-type": f"image/{ext}"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(bucket).get_public_url(filepath)
        
        return public_url
    except Exception as e:
        raise Exception(f"Failed to upload file: {str(e)}")


def delete_from_supabase(bucket: str, filepath: str) -> bool:
    """Delete file from Supabase Storage"""
    try:
        supabase = get_supabase()
        if not supabase:
            return False
        
        supabase.storage.from_(bucket).remove([filepath])
        return True
    except Exception as e:
        return False
