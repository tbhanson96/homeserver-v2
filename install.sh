echo "Installing all necessary files..."
cd server/src
echo "Building server..."
npm install
npm run build
echo "Finished building server."

cd ../../client/src
echo "Building client..."
npm install
npm run build
echo "Finished building client"

cd ../..