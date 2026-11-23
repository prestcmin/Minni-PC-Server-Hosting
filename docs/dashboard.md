# Dashboard Documentation

## Purpose

The dashboard provides a browser-based interface for monitoring and managing game servers.

The frontend communicates with the FastAPI backend, which retrieves database information and live Docker information.

## Frontend location

```text
frontend/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── components/
│   │   ├── CreateServerForm.jsx
│   │   ├── ServerDetails.jsx
│   │   ├── ServerList.jsx
│   │   └── ServerStatusBadge.jsx
│   └── services/
│       └── api.js
