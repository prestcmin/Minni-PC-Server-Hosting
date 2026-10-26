from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.database import Server
from ..models.server import ServerRequest
from ..services.ansible_service import run_ansible

router = APIRouter(
    prefix="/servers",
    tags=["servers"],
)

@router.get("")
def list_servers(
    database: Session = Depends(get_db),
):
    servers = database.scalars(
        select(Server).order_by(Server.created_at.desc())
    ).all()

    return [
        serialize_server(server)
        for server in servers
    ]

def serialize_server(server: Server) -> dict:
    return {
        "server_name": server.server_name,
        "game": server.game,
        "port_number": server.port_number,
        "world_name": server.world_name,
        "world_size": server.world_size,
        "difficulty": server.difficulty,
        "valheim_modifier": server.valheim_modifier,
        "status": server.status,
        "last_error": server.last_error,
    }

def perform_server_action(
    request: ServerRequest,
    server_id: str,
    action: str,
    database: Session,
):
    server = database.get(Server, server_id)

    if action == "deploy":
        if server is None:
            server = Server(
                server_name=server_id,
                game=request.game,
                port_number=request.port_number,
            )

        server.game = request.game
        server.port_number = request.port_number
        server.world_name = request.world_name
        server.world_size = request.world_size
        server.difficulty = request.difficulty
        server.valheim_modifier = request.valheim_modifier
        server.status = "deploying"
        server.last_error = None

        database.add(server)
        database.commit()
        database.refresh(server)

    elif server is None:
        raise HTTPException(
            status_code=404,
            detail="Server was not found.",
        )

    result = run_ansible(
        action=action,
        game=request.game,
        server_name=server_id,
        port_number=request.port_number,
        world_name=request.world_name,
        world_size=request.world_size,
        difficulty=request.difficulty,
        valheim_modifier=request.valheim_modifier,
    )

    if not result.success:
        server.status = "failed"
        server.last_error = "Ansible operation failed."
        server.updated_at = datetime.now(timezone.utc)

        database.commit()

        raise HTTPException(
            status_code=500,
            detail={
                "message": "Ansible operation failed.",
                "return_code": result.return_code,
            },
        )

    if action == "remove":
        database.delete(server)
        database.commit()

        return {
            "success": True,
            "server_name": server_id,
            "action": action,
        }

    if action in ["deploy", "start", "restart"]:
        server.status = "running"
    elif action == "stop":
        server.status = "stopped"

    server.last_error = None
    server.updated_at = datetime.now(timezone.utc)

    database.commit()
    database.refresh(server)

    return {
        "success": True,
        "server": serialize_server(server),
        "message": "Server action completed successfully.",
    }

@router.post("/{server_id}/deploy")
def deploy_server(
    server_id: str,
    request: ServerRequest,
    database: Session = Depends(get_db),
):
    return perform_server_action(
        request=request,
        server_id=server_id,
        action="deploy",
        database=database,
    )

@router.post("/{server_id}/start")
def start_server(
    server_id: str,
    request: ServerRequest,
    database: Session = Depends(get_db),
):
    return perform_server_action(
        request=request,
        server_id=server_id,
        action="start",
        database=database,
    )


@router.post("/{server_id}/stop")
def stop_server(
    server_id: str,
    request: ServerRequest,
    database: Session = Depends(get_db),
):
    return perform_server_action(
        request=request,
        server_id=server_id,
        action="stop",
        database=database,
    )


@router.post("/{server_id}/restart")
def restart_server(
    server_id: str,
    request: ServerRequest,
    database: Session = Depends(get_db),
):
    return perform_server_action(
        request=request,
        server_id=server_id,
        action="restart",
        database=database,
    )


@router.delete("/{server_id}")
def remove_server(
    server_id: str,
    request: ServerRequest,
    database: Session = Depends(get_db),
):
    return perform_server_action(
        request=request,
        server_id=server_id,
        action="remove",
        database=database,
    )
