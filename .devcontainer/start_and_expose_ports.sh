#!/bin/bash
set -e

# Start the dev server and pipe logs
echo "Starting dev server..."
npm run dev > /tmp/dev.log 2>&1 &

# Wait for both ports to become available
echo "Waiting for ports to open..."
for port in 4000 5173; do
  for i in {1..30}; do
    if nc -z localhost $port; then
      echo "Port $port is open"
      break
    fi
    sleep 1
  done
done

# Set ports to public
echo "Exposing ports..."
gh codespace ports visibility 4000:public -c "$CODESPACE_NAME"
gh codespace ports visibility 5173:public -c "$CODESPACE_NAME"

# Tail logs forever to keep the container alive
echo "Tailing logs..."
tail -f /tmp/dev.log