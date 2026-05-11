# ============================================
# Sync Cron Job (Docker entrypoint)
# ============================================
#!/bin/bash

# Start the Next.js app
echo "Starting Next.js app..."
npm start &

# Start the sync scheduler (runs every 6 hours)
echo "Starting sync scheduler..."
node /app/src/scripts/sync-all.ts &

# Wait for processes
wait
