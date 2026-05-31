#!/usr/bin/env bash
cd "$(dirname "$0")"
nohup node server.js > awaaz.log 2>&1 &
echo $! > .awaaz.pid
sleep 1
echo "Started, pid: $(cat .awaaz.pid)"
tail -n 20 awaaz.log
