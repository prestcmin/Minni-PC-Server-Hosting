from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..repositories import server_repository, world_repository, event_repository
from ..database import get_db
from ..models.database import Game, Server, World
from ..models.server import ServerRequest
from ..models.player import PlayerSeenRequest
from ..repositories.player_repository import record_player_seen
from ..services.ansible_service import run_ansible
from ..services.docker_service import reconcile_servers

router = APIRouter(
    prefix="/servers",
    tags=["servers"],
)

def get_server_by_name(database: Session, server_name: str):
    return server_repository.get_by_name(database, server_name)

@router.post("/{server_id}/players")
def record_player(
    server_id: str,
    request: PlayerSeenRequest,
    database: Session = Depends(get_db),
):
    server = get_server_by_name(database, server_id)

    if server is None:
        raise HTTPException(
            status_code=404,
            detail="Server was not found.",
        )

    server_player = record_player_seen(
        database=database,
        server_id=server.id,
        player_uuid=request.player_uuid,
        display_name=request.display_name,
    )

    return {
        "success": True,
        "server_name": server.server_name,
        "player": {
            "id": server_player.player.id,
            "player_uuid": server_player.player.player_uuid,
            "display_name": server_player.player.display_name,
        },
        "server_player": {
            "first_joined_at": server_player.first_joined_at,
            "last_seen_at": server_player.last_seen_at,
            "join_count": server_player.join_count,
            "total_playtime_seconds": (
                server_player.total_playtime_seconds
            ),
            "is_active": server_player.is_active,
        },
    }

@router.get("")
def list_servers(
    database: Session = Depends(get_db),
):
    reconcile_servers(database)

    servers = server_repository.list_all(database)

    return [
        serialize_server(server)
        for server in servers
    ]

def serialize_server(server: Server) -> dict:
    return {
        "id": server.id,
        "server_name": server.server_name,
        "game": server.game.slug if server.game else None,
        "port_number": server.port_number,
        "container_name": server.container_name,
        "compose_project": server.compose_project,
        "status": server.status,
        "last_error": server.last_error,
    }

def perform_server_action(
    request: ServerRequest,
    server_id: str,
    action: str,
    database: Session,
):
    game_record = database.scalar(
       select(Game).where(Game.slug == request.game)
    )

    if game_record is None:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported game: {request.game}",
        )

    server = get_server_by_name(database, server_id)

    if action == "deploy":
        if server is None:
            server = Server(
                server_name=server_id,
                game=game_record,
                port_number=request.port_number,
        container_name=server_id,
        compose_project=server_id,
        status="deploying",
            )

        server.game = game_record
        server.port_number = request.port_number
        server.world_name = request.world_name
        server.world_size = request.world_size
        server.difficulty = request.difficulty
        server.valheim_modifier = request.valheim_modifier
        server.status = "deploying"
        server.last_error = None

        server_repository.save(database, server)

        world = world_repository.get_active_for_server(
            database,
            server.id,
        )
    
        if world is None:
            world = World(
                server_id=server.id,
                world_name=request.world_name or "world",
                is_active=True,
            )
    
        world.world_name = request.world_name or "world"
        world.world_size = request.world_size
        world.difficulty = request.difficulty
        world.valheim_modifier = request.valheim_modifier
        world.world_path = (
            f"/opt/{request.game}/config/Worlds/"
            f"{world.world_name}.wld"
            if request.game == "terraria"
            else None
        )
    
        world_repository.save(database, world)

    elif server is None:
        raise HTTPException(
            status_code=404,
            detail="Server was not found.",
        )

    event_repository.create_event(
        database=database,
        server_id=server.id,
        event_type=action,
        status="started",
        message=f"{action} action started.",
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

        server_repository.save(database, server)

        event_repository.create_event(
            database=database,
            server_id=server.id,
            event_type=action,
            status="failed",
            message=result.stderr or "Ansible operation failed.",
            return_code=result.return_code,
        )

        raise HTTPException(
            status_code=500,
            detail={
                "message": "Ansible operation failed.",
                "return_code": result.return_code,
            },
        )

    event_repository.create_event(
        database=database,
        server_id=server.id,
        event_type=action,
        status="succeeded",
        message=f"{action} action completed successfully.",
        return_code=result.return_code,
    )

    if action == "remove":
        server_repository.delete(database, server)

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

    server_repository.save(database, server)

    return {
        "success": True,
        "server": serialize_server(server),
    "action": action,
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
def delete_server(
    server_id: str,
    database: Session = Depends(get_db),
):
    server = get_server_by_name(database, server_id)

    if server is None:
        raise HTTPException(
            status_code=404,
            detail="Server not found",
        )

    result = run_ansible(
        action="remove",
        game=server.game,
        server_name=server.server_name,
        port_number=server.port_number,
        world_name=server.world_name,
        world_size=server.world_size,
        difficulty=server.difficulty,
    valheim_modifier=server.valheim_modifier,
 )

    # Delete the database record even if the container is already missing.
    server_repository.delete(database, server)

    return {
        "success": True,
        "server_name": server.server_name,
        "action": "remove",
        "container_removed": result.success,
        "cleanup_error": None if result.success else result.stderr,
    }
