run_command()
{
    eval $1
    if [ $? -ne 0 ]
    then
        exit 1
    fi
}

DEST_DIR=/usr/local/share/homeserver

run_command "./bin/build.sh"
cd dist
run_command "tar zcf homeserver.tar.gz *"
run_command "scp homeserver.tar.gz tim@hansonserver.ddns.net:$DEST_DIR"
run_command "ssh tim@hansonserver.ddns.net \"mkdir -p $DEST_DIR/updates && mv $DEST_DIR/homeserver.tar.gz $DEST_DIR/updates\""

