#!/bin/bash
set -e

wait_for_port() {
  local port=$1
  echo "Waiting for port $port to be available..."

  for i in {1..30}; do
    if nc -z localhost "$port"; then
      echo "Port $port is open."
      return
    fi
    sleep 1
  done

  echo "Timeout waiting for port $port."
  exit 1
}

for port in "$@"; do
  wait_for_port "$port"
done