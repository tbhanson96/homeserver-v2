SCRIPT=$(readlink -f "$BASH_SOURCE")
DIRNAME=$(dirname "$SCRIPT")
echo $DIRNAME
echo "Installing all necessary files..."
cd $DIRNAME/../server/src
echo "Building server..."
npm install
npm run build
echo "Finished building server."

cd $DIRNAME/../client/src
echo "Building client..."
npm install
npm run build:prod
echo "Finished building client"

cd ../..