from fastapi import FastAPI

from .routes.servers import router as server_router


app = FastAPI(
    title="Minni-PC Server Hosting API",
    version="0.1.0",
)


app.include_router(server_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }
