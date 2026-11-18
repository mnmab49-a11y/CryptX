import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.database import engine, init_db
from app.services.storage_service import storage_service
from app.api.routes import (
    auth_router,
    users_router,
    crypto_router,
    vault_router,
    activity_router,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cryptx")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and storage path is prepared
    logger.info("Initializing CryptX Backend...")
    init_db()
    logger.info(f"Storage directory confirmed at {settings.STORAGE_DIR}")
    yield
    logger.info("Shutting down CryptX Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CryptX — Cloud-Based Multi-Format Encryption & Secure Storage Platform REST API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https:\/\/(cryptx(-[a-z0-9\-]+)?|crypt-[a-z0-9\-]+)\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-SHA256-Checksum"],
)

# Mount API v1 Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(crypto_router, prefix=settings.API_V1_STR)
app.include_router(vault_router, prefix=settings.API_V1_STR)
app.include_router(activity_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }

@app.get("/health", tags=["Health"])
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        logger.exception("Database health check failed")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "database": "unavailable"},
        )

    return {
        "status": "healthy",
        "database": "connected",
        "database_engine": engine.dialect.name,
        "encryption_engine": "AES-256-GCM (Hardware/Software AEAD)",
    }
