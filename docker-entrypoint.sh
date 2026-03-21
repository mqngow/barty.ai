#!/bin/sh
set -e

# Start the API server
cd /app/api-server
node --enable-source-maps ./dist/index.mjs &

# Serve the frontend (built static files)
serve /app/frontend/dist -p 3000 --single &

wait
