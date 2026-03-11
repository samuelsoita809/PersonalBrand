#!/bin/bash

# Disaster Recovery: Database Backup Script
# Usage: ./backup.sh [BACKUP_PATH]

DB_URL=$DATABASE_URL
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${1:-./backups}/backup_${TIMESTAMP}.sql"

mkdir -p $(dirname $BACKUP_FILE)

echo "[$(date)] Starting backup to $BACKUP_FILE..."

# Use pg_dump if available, else use a dummy placeholder for this environment
if command -v pg_dump &> /dev/null
then
    pg_dump $DB_URL > $BACKUP_FILE
    echo "[$(date)] Backup completed successfully."
else
    echo "[$(date)] ERROR: pg_dump not found. Ensure postgresql-client is installed."
    exit 1
fi

# In production, we would upload to S3 here:
# aws s3 cp $BACKUP_FILE s3://brand-backups/
