from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.common import create_response
from app.core.config import settings
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user
import uuid
from PIL import Image
import io

router = APIRouter()

def validate_image(file: UploadFile) -> bool:
    """Validate image file."""
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        return False
    
    if file.size and file.size > settings.MAX_FILE_SIZE:
        return False
    
    return True

@router.post("/product-image")
async def upload_product_image(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Upload product image."""
    try:
        user = await get_current_user(credentials)
        
        if user["role"] != "farmer":
            return create_response(
                success=False,
                message="Only farmers can upload product images",
                errors={"auth": "Insufficient permissions"}
            )
        
        if not validate_image(file):
            return create_response(
                success=False,
                message="Invalid image file",
                errors={"file": "File must be a valid image (JPEG, PNG, WebP) and under 5MB"}
            )
        
        # Read file contents
        contents = await file.read()
        
        # Optional: Resize image
        try:
            image = Image.open(io.BytesIO(contents))
            # Resize if too large
            max_size = (1200, 1200)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Convert back to bytes
            output = io.BytesIO()
            image.save(output, format=image.format or "JPEG", quality=85, optimize=True)
            contents = output.getvalue()
        except Exception:
            pass  # If resize fails, use original
        
        # Generate unique filename
        file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
        filename = f"products/{user['id']}/{uuid.uuid4()}.{file_ext}"
        
        # Upload to Supabase Storage
        storage = supabase_admin_client.storage.from_("products")
        result = storage.upload(filename, contents)
        
        # Get public URL
        public_url = storage.get_public_url(filename)
        
        return create_response(
            success=True,
            message="Image uploaded successfully",
            data={"url": public_url}
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to upload image",
            errors={"server": str(e)}
        )

@router.post("/profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Upload profile image."""
    try:
        user = await get_current_user(credentials)
        
        if not validate_image(file):
            return create_response(
                success=False,
                message="Invalid image file",
                errors={"file": "File must be a valid image (JPEG, PNG, WebP) and under 5MB"}
            )
        
        # Read file contents
        contents = await file.read()
        
        # Resize to profile size
        try:
            image = Image.open(io.BytesIO(contents))
            # Make square and resize
            min_dimension = min(image.size)
            left = (image.width - min_dimension) / 2
            top = (image.height - min_dimension) / 2
            right = left + min_dimension
            bottom = top + min_dimension
            
            image = image.crop((left, top, right, bottom))
            image = image.resize((400, 400), Image.Resampling.LANCZOS)
            
            # Convert to bytes
            output = io.BytesIO()
            image.save(output, format="JPEG", quality=90, optimize=True)
            contents = output.getvalue()
        except Exception:
            pass
        
        # Generate unique filename
        filename = f"profiles/{user['id']}/{uuid.uuid4()}.jpg"
        
        # Upload to Supabase Storage
        storage = supabase_admin_client.storage.from_("profiles")
        result = storage.upload(filename, contents)
        
        # Get public URL
        public_url = storage.get_public_url(filename)
        
        # Update user profile
        supabase_admin_client.table("users").update({"profile_image_url": public_url}).eq("id", user["id"]).execute()
        
        return create_response(
            success=True,
            message="Profile image uploaded successfully",
            data={"url": public_url}
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to upload profile image",
            errors={"server": str(e)}
        )
