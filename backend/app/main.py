from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import auth, users, products, orders, cart, subscriptions, wallet, reviews, analytics


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agricultural marketplace platform connecting farmers and consumers",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "api_version": settings.VERSION
    }


# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["Users"])
app.include_router(products.router, prefix=f"{settings.API_V1_PREFIX}/products", tags=["Products"])
app.include_router(reviews.router, prefix=f"{settings.API_V1_PREFIX}/reviews", tags=["Reviews"])
app.include_router(cart.router, prefix=f"{settings.API_V1_PREFIX}/cart", tags=["Cart"])
app.include_router(orders.router, prefix=f"{settings.API_V1_PREFIX}/orders", tags=["Orders"])
app.include_router(subscriptions.router, prefix=f"{settings.API_V1_PREFIX}/subscriptions", tags=["Subscriptions"])
app.include_router(wallet.router, prefix=f"{settings.API_V1_PREFIX}/wallet", tags=["Wallet"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_PREFIX}/analytics", tags=["Analytics"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
