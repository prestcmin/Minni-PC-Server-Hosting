#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

INVENTORY="$PROJECT_DIR/server-management/inventory.ini"
PLAYBOOK="$PROJECT_DIR/server-management/site.yaml"

ACTION="${1:-}"
GAME="${2:-}"
SERVER_NAME="${3:-}"
PORT_NUMBER="${4:-7777}"
WORLD_NAME="${5:-world}"
WORLD_SIZE="${6:-2}"


usage() {
    echo "Usage:"
    echo "  $0 <action> <game> <server_name> [port] [world_name] [world_size]"
    echo
    echo "Actions:"
    echo "  deploy"
    echo "  start"
    echo "  stop"
    echo "  restart"
    echo "  remove"
    echo
    echo "Games:"
    echo "  minecraft"
    echo "  terraria"
    echo "  valheim"
    echo
    echo "Example:"
    echo "  $0 deploy terraria terraria-01 7777 world 2"
}


if [[ -z "$ACTION" || -z "$GAME" || -z "$SERVER_NAME" ]]; then
    usage
    exit 1
fi


case "$ACTION" in
    deploy|start|stop|restart|remove)
        ;;
    *)
        echo "Error: unsupported action: $ACTION"
        usage
        exit 1
        ;;
esac


case "$GAME" in
    minecraft|terraria|valheim)
        ;;
    *)
        echo "Error: unsupported game: $GAME"
        usage
        exit 1
        ;;
esac


if [[ ! "$SERVER_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "Error: invalid server name."
    echo "Use only letters, numbers, underscores, and hyphens."
    exit 1
fi


if [[ ! "$PORT_NUMBER" =~ ^[0-9]+$ ]]; then
    echo "Error: port must be a number."
    exit 1
fi


if (( PORT_NUMBER < 1024 || PORT_NUMBER > 65535 )); then
    echo "Error: port must be between 1024 and 65535."
    exit 1
fi


if [[ ! -f "$INVENTORY" ]]; then
    echo "Error: inventory file not found:"
    echo "$INVENTORY"
    exit 1
fi


if [[ ! -f "$PLAYBOOK" ]]; then
    echo "Error: playbook not found:"
    echo "$PLAYBOOK"
    exit 1
fi


EXTRA_VARS=(
    "-e" "server_action=$ACTION"
    "-e" "selected_game=$GAME"
    "-e" "server_name=$SERVER_NAME"
    "-e" "port_number=$PORT_NUMBER"
    "-e" "world_name=$WORLD_NAME"
    "-e" "world_size=$WORLD_SIZE"
)


echo "Running action: $ACTION"
echo "Game: $GAME"
echo "Server: $SERVER_NAME"

ansible-playbook \
    -i "$INVENTORY" \
    "$PLAYBOOK" \
    "${EXTRA_VARS[@]}"
