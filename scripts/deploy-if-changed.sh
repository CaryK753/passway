#!/bin/sh
set -eu

project_dir=${PASSWAY_PROJECT_DIR:-/opt/passway}
lock_file=${PASSWAY_DEPLOY_LOCK:-/tmp/passway-deploy.lock}

exec 9>"$lock_file"
if ! flock -n 9; then
  echo "passway deploy already running"
  exit 0
fi

cd "$project_dir"
git fetch --quiet origin main
current=$(git rev-parse HEAD)
target=$(git rev-parse origin/main)
if [ "$current" = "$target" ]; then
  echo "passway already current: $current"
  exit 0
fi

git merge --ff-only "$target"
docker compose up -d --build

attempt=0
while [ "$attempt" -lt 30 ]; do
  status=$(docker inspect -f '{{.State.Health.Status}}' passway-web 2>/dev/null || true)
  if [ "$status" = "healthy" ]; then
    echo "passway deployed: $target"
    exit 0
  fi
  attempt=$((attempt + 1))
  sleep 2
done

echo "passway deployment unhealthy at $target" >&2
docker compose ps >&2
exit 1
