#!/bin/sh
set -e

# Generate runtime env-config.js dynamically from environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-http://localhost:5000/api}",
  VITE_SOCKET_URL: "${VITE_SOCKET_URL:-http://localhost:5000}"
};
EOF

echo "⚡ [NexusArena Frontend] Injected runtime environment:"
cat /usr/share/nginx/html/env-config.js

exec "$@"
