/**
 * Script to start a test database.
 */
import { execSync } from 'child_process';
import { ConfigService } from '../server/src/config/config.service';

const configService = new ConfigService();

const script = `
  /usr/bin/podman run --rm --name homeserverdb-test \
    -p ${configService.config.app.dbPort}:27017 \
    -v ${configService.config.health.healthDir}/data:/data/db \
    -v ${configService.config.health.healthDir}/config:/data/configdb \
    docker.io/mongo:latest
`;

// Execute script 
const output = execSync(script, { stdio: 'inherit' });