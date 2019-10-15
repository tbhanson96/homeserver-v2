"Starting application..."
SCRIPT=$(readlink -f "$BASH_SOURCE")
DIRNAME=$(dirname "$SCRIPT")
node $DIRNAME/../server/dist/main.js
