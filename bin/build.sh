run_command()
{
    eval $1
    if [ $? -ne 0 ]
    then
        exit 1
    fi
}

SCRIPT=$(readlink -f "$BASH_SOURCE")
DIRNAME=$(dirname "$SCRIPT")
echo "Installing all necessary files..."
cd $DIRNAME/../server
echo "Building server..."
run_command "npm install"
run_command "npm run package"
echo "Finished building server."

cd $DIRNAME/../client
echo "Building client..."
run_command "npm install"
run_command "npm run build:prod"
echo "Finished building client"

cd ../..