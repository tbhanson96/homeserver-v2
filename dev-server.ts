import { spawn, execSync } from 'child_process';
import path from 'path';

const start = () => {
    let clientBuild, serverBuild = null;
    try {
        const clientPath = path.resolve(__dirname, 'client');
        const serverPath = path.resolve(__dirname, 'server');

        clientBuild = spawn('npm', ['run', 'build:watch'], { cwd: clientPath });
        clientBuild.stdout.on('data', (data) => {
            console.log('[CLIENT]: ' + data);
        });
        clientBuild.stderr.on('data', (data) => {
            console.error('[CLIENT]: ' + data);
        });
        clientBuild.on('error', (err) => {
            console.log('[CLIENT]: ' + err);
        });

        serverBuild = spawn('npm', ['run', "start:watch"], { cwd: serverPath });
        serverBuild.stdout.on('data', (data) => {
            console.log('[SERVER]' + data);
            if (data.toString().includes('Nest application successfully started')) {
                try {
                    execSync('npm run swagger', { cwd: serverPath });
                    execSync('npm run codegen', { cwd: clientPath });
                } catch (e) {
                    //do nothing
                }
            }
        });

        serverBuild.stderr.on('data', (data) => {
            console.error('[SERVER]: ' + data);
        });
        serverBuild.stderr.on('error', (err) => {
            console.error('[SERVER]: ' + err);
        });
    } catch {
        clientBuild?.kill(9);
        serverBuild?.kill(9);
    }
}
start();