from pydantic import BaseModel, Field


class PlayerSeenRequest(BaseModel):
    player_uuid: str = Field(min_length=1, max_length=128)
    display_name: str = Field(min_length=1, max_length=128)
