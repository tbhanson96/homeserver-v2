echo "Starting application..."
SCRIPT=$(readlink -f "$BASH_SOURCE")
DIRNAME=$(dirname "$SCRIPT")
node $DIRNAME/../dist/server/main.js