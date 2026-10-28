from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import time
from fastapi import Request

from .config import settings
from .database_setup import initialize_database
from .routes.servers import router as server_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Minni-PC Server Hosting API",
    version="0.1.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://192.168.1.134:5173",
        "http://192.168.1.212:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)


app.include_router(server_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()

    print(
        f"[REQUEST] {request.method} "
        f"{request.url.path} from {request.client.host if request.client else 'unknown'}"
    )

    response = await call_next(request)

    elapsed = time.perf_counter() - start_time

    print(
        f"[RESPONSE] {request.method} "
        f"{request.url.path} -> {response.status_code} "
        f"({elapsed:.3f}s)"
    )

    return response
