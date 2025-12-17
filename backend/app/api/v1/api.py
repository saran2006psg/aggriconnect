from fastapi import APIRouter
from app.api.v1.endpoints import auth, products, cart, orders, subscriptions, bulk_orders, users, reviews, notifications, admin, upload

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(cart.router, prefix="/cart", tags=["Cart"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
api_router.include_router(bulk_orders.router, prefix="/bulk-orders", tags=["Bulk Orders"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
