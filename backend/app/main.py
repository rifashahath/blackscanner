"""
BlackScanner — AI-Powered Web Vulnerability Scanner
Main FastAPI application entry point.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db, async_session
from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"[BlackScanner] Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()

    print("[BlackScanner] Database initialized.")
    yield
    # Shutdown
    print("[BlackScanner] Shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Web Vulnerability Scanner API",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
