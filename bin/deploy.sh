# travis env vars DEPLOY_USER, DEPLOY_HOST, DEPLOY_DIR must be defined in travis repository settings
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

run_command "mkdir -p $DIRNAME/../dist"
cd "$DIRNAME/../server"
run_command "npm run package"
run_command "cp $DIRNAME/../server/dist/server $DIRNAME/../dist/"
run_command "cp -r $DIRNAME/../client/dist $DIRNAME/../dist/client"

run_command "VERSION=$(cat $DIRNAME/../VERSION.txt)"
TAR_FILE="homeserver-$VERSION-$TRAVIS_BUILD_NUMBER.tar.gz"

cd "$DIRNAME/../dist"
run_command "tar zcf $TAR_FILE *"
run_command "scp $TAR_FILE $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_DIR"