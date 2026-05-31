#!/usr/bin/env bash
cd "$(dirname "$0")"
if [ -f .awaaz.pid ]; then
  PID=$(cat .awaaz.pid)
  kill "$PID" && echo "Stopped $PID" || echo "Failed to stop $PID"
  rm -f .awaaz.pid
else
  echo ".awaaz.pid not found"
fi
