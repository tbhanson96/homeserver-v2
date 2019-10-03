const TscWatchClient = require('tsc-watch/client');
const tscClient = new TscWatchClient();
const { spawn } = require('child_process');
const path = require('path');

const child = spawn('npm', ['run', 'build:watch'], { cwd: path.join(__dirname, '..', 'client')})
child.stdout.on('data', (data) => {
    console.log('[CLIENT]: ' + data.toString());
});
child.stderr.on('data', (data) => {
    console.error('[CLIENT]: ' + data.toString());
});
child.on('error', (err) => {
    console.log('[CLIENT]: ' + err);
    process.exit(-1);
});

tscClient.on('success', () => {
    start();
});
tscClient.on('compile_errors', () => {
    console.log('[SERVER]: Error compiling source code:');
});
tscClient.start('-p', 'tsconfig.build.json');

var app;
async function start() {
    const { bootstrap } = require('./dist/main');
    if(app) {
        await app.close();
    }
    app = await bootstrap();
}