| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Check whether the backend is running |
| `GET` | `/servers` | List managed servers |
| `POST` | `/servers/{game}/deploy` | Deploy a new server |
| `POST` | `/servers/{id}/start` | Start a server |
| `POST` | `/servers/{id}/stop` | Stop a server |
| `POST` | `/servers/{id}/restart` | Restart a server |
| `DELETE` | `/servers/{id}` | Remove a server|
| `GET` | `/servers/{id}/status` | Return current status |


backend/
├── app/
│   ├── main.py
│   ├── routes/
│   │   └── servers.py
│   ├── services/
│   │   ├── ansible_service.py
│   │   ├── docker_service.py
│   │   ├── amp_service.py
│   │   └── playit_service.py
│   ├── models/
│   │   └── server.py
│   └── config.py
├── tests/
└── requirements.txt

server-management/
├── site.yaml
├── inventory.ini
├── requirements.yaml
└── roles/
    └── game_server/
