echo "Starting application..."
SCRIPT=$(readlink -f "$BASH_SOURCE")
DIRNAME=$(dirname "$SCRIPT")
eval $DIRNAME/../dist/server/server