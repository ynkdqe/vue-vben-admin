#!/usr/bin/env bash
# Blue-Green deploy script for Vue Vben HRMS (zero downtime)
# Usage: deploy-blue-green.sh IMAGE [SERVICE_NAME] [CONTAINER_PORT] [HEALTH_PATH]
# Default host blue/green ports: blue=8205 green=8206 (override BLUE_PORT / GREEN_PORT)
# Public exposure via nginx reverse proxy listening on PUBLIC_PORT (default 8080)
# Auto-detect active color by inspecting running containers & ports, then updates nginx upstream.

set -Eeuo pipefail

IMAGE=${1:?IMAGE required}
SERVICE=${2:-annal-fe-antd}
CPORT=${3:-8080}          # internal container port the app listens on
HEALTH=${4:-/health}
BLUE_PORT=${BLUE_PORT:-8205}
GREEN_PORT=${GREEN_PORT:-8206}
PUBLIC_PORT=${PUBLIC_PORT:-8080}
ALIAS=${SERVICE}-service
NET=${SERVICE}-net
ACTIVE_FILE=/var/run/${SERVICE}-active
SUDO=$(command -v sudo || echo "")
GHCR_USER=${GHCR_USER:-}
GHCR_TOKEN=${GHCR_TOKEN:-}

log() { echo "[$(date -u +%H:%M:%S)] $*"; }
need() { if ! command -v "$1" >/dev/null 2>&1; then log "Install $1"; ${SUDO} apt-get update -y && ${SUDO} apt-get install -y "$2"; fi; }

need docker docker.io
need curl curl
${SUDO} systemctl enable --now nginx >/dev/null 2>&1 || true

# Ensure docker network
if ! ${SUDO} docker network inspect "$NET" >/dev/null 2>&1; then
  log "Create network $NET"; ${SUDO} docker network create "$NET"
fi

# Login registry (optional for GitHub Container Registry)
if [[ -n "$GHCR_USER" && -n "$GHCR_TOKEN" ]]; then
  log "Login GHCR as $GHCR_USER"; echo "$GHCR_TOKEN" | ${SUDO} docker login ghcr.io -u "$GHCR_USER" --password-stdin || true
fi

log "Pull image $IMAGE"; ${SUDO} docker pull "$IMAGE"

# Detect active color
active_detected=""
if ${SUDO} docker ps --format '{{.Names}}' | grep -q "^${SERVICE}-blue$"; then active_detected=blue; fi
if ${SUDO} docker ps --format '{{.Names}}' | grep -q "^${SERVICE}-green$"; then
  if [[ -n "$active_detected" ]]; then
    [[ -f "$ACTIVE_FILE" ]] && active_detected=$(cat "$ACTIVE_FILE" 2>/dev/null || echo blue)
  else
    active_detected=green
  fi
fi
[[ -z "$active_detected" && -f "$ACTIVE_FILE" ]] && active_detected=$(cat "$ACTIVE_FILE" 2>/dev/null || echo blue)
[[ -z "$active_detected" ]] && active_detected=blue
ACTIVE_COLOR=$active_detected

# Port busy check
port_busy() { ss -ltn 2>/dev/null | grep -q ":$1" || netstat -tln 2>/dev/null | grep -q ":$1" || return 1; }

preferred_new=$([[ $ACTIVE_COLOR == blue ]] && echo green || echo blue)
choose_color() {
  local cand=$1
  local port=$([[ $cand == blue ]] && echo $BLUE_PORT || echo $GREEN_PORT)
  if ${SUDO} docker ps -a --format '{{.Names}}' | grep -q "^${SERVICE}-${cand}$"; then
    ${SUDO} docker rm -f "${SERVICE}-${cand}" >/dev/null 2>&1 || true
  fi
  if port_busy $port; then return 1; fi
  echo $cand; return 0
}

NEW_COLOR=""
if NEW_COLOR=$(choose_color $preferred_new); then :; else
  alt=$([[ $preferred_new == blue ]] && echo green || echo blue)
  if NEW_COLOR=$(choose_color $alt); then
    ACTIVE_COLOR=$([[ $alt == blue ]] && echo green || echo blue)
    log "Adjusted active assumption to $ACTIVE_COLOR due to port in-use"
  else
    log "ERROR: Both blue/green ports ($BLUE_PORT,$GREEN_PORT) busy."; exit 1
  fi
fi

HOST_PORT=$([[ $NEW_COLOR == blue ]] && echo $BLUE_PORT || echo $GREEN_PORT)
NEW_NAME=${SERVICE}-${NEW_COLOR}
OLD_NAME=${SERVICE}-${ACTIVE_COLOR}

log "Active=$ACTIVE_COLOR -> Deploy $NEW_COLOR (host $HOST_PORT -> container $CPORT, public via :$PUBLIC_PORT)"
${SUDO} docker rm -f "$NEW_NAME" >/dev/null 2>&1 || true

# Docker run arguments optimized for Vue SPA
RUN_ARGS=( 
  -d 
  --restart=always 
  --name "$NEW_NAME" 
  --network "$NET" 
  --network-alias ${ALIAS}-${NEW_COLOR} 
  -p ${HOST_PORT}:${CPORT}
  -e NODE_ENV=production
  -e TZ=Asia/Ho_Chi_Minh
)

log "Run container $NEW_NAME"
${SUDO} docker run "${RUN_ARGS[@]}" "$IMAGE"

# Wait for container to start
for i in {1..20}; do 
  ${SUDO} docker ps --format '{{.Names}}' | grep -q "^${NEW_NAME}$" && break
  sleep 1
  [[ $i == 20 ]] && { log "Container failed to start"; exit 1; }
done

log "Switch docker network alias $ALIAS"
if ${SUDO} docker ps --format '{{.Names}}' | grep -q "^${OLD_NAME}$"; then
  ${SUDO} docker network disconnect "$NET" "$OLD_NAME" >/dev/null 2>&1 || true
  ${SUDO} docker network connect "$NET" "$OLD_NAME" >/dev/null 2>&1 || true
fi
${SUDO} docker network disconnect "$NET" "$NEW_NAME" >/dev/null 2>&1 || true
${SUDO} docker network connect --alias ${ALIAS} "$NET" "$NEW_NAME"

# Save active color
echo $NEW_COLOR | ${SUDO} tee $ACTIVE_FILE >/dev/null

# Remove old container (graceful shutdown)
if ${SUDO} docker ps --format '{{.Names}}' | grep -q "^${OLD_NAME}$"; then
  log "Gracefully stopping old container $OLD_NAME"
  ${SUDO} docker stop -t 20 "$OLD_NAME" >/dev/null 2>&1 || true
  ${SUDO} docker rm -f "$OLD_NAME" >/dev/null 2>&1 || true
fi

# Cleanup old images
log "Cleanup old images"
${SUDO} docker image prune -f >/dev/null 2>&1 || true

# Final verification
sleep 2
if curl -fsS "http://127.0.0.1:${PUBLIC_PORT}/" >/dev/null 2>&1; then
  log "✅ Deploy SUCCESS -> $NEW_NAME (color: $NEW_COLOR, internal port: $HOST_PORT, public port: $PUBLIC_PORT)"
  log "🌐 HRMS App is accessible at http://your-domain:$PUBLIC_PORT"
else
  log "⚠️  Deploy completed but health check failed on public port $PUBLIC_PORT"
  exit 1
fi
