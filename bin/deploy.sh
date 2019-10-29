# travis env vars DEPLOY_USER, DEPLOY_HOST, DEPLOY_DIR must be defined in travis repository settings
run_command()
{
    eval $1
    if [ $? -ne 0 ]
    then
        exit 1
    fi
}

run_command "./bin/build.sh"
cd dist
run_command "tar zcf homeserver.tar.gz *"
run_command "scp homeserver.tar.gz $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_DIR"
run_command "ssh $DEPLOY_USER@$DEPLOY_HOST \"mkdir -p $DEPLOY_DIR/updates && mv $DEPLOY_DIR/homeserver.tar.gz $DEPLOY_DIR/updates\""
