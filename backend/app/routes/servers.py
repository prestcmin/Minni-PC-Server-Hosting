from fastapi import APIRouter, HTTPException

from ..models.server import ServerRequest
from ..services.ansible_service import run_ansible


router = APIRouter(
    prefix="/servers",
    tags=["servers"],
)


@router.post("/action")
def server_action(request: ServerRequest):
    result = run_ansible(
        action=request.action,
        game=request.game,
        server_name=request.server_name,
        port_number=request.port_number,
        world_name=request.world_name,
        world_size=request.world_size,
    )

    if not result.success:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Ansible operation failed.",
                "return_code": result.return_code,
            },
        )

    return {
        "success": True,
        "server_name": request.server_name,
        "game": request.game,
        "action": request.action,
        "message": "Ansible operation completed successfully.",
    }
