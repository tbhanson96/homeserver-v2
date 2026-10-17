// tslint:disable-next-line:no-var-requires
const { buildApi } = require('./dist/main');
import fs from 'fs';
import path from 'path';

const main = async () => {
    const doc = await buildApi();
    const json = JSON.stringify(doc, null, 2);
    await fs.promises.writeFile(path.join(__dirname, '..', 'swagger.json') , json, 'utf8');
    process.stdout.write('Successfully wrote swagger.json to file.\n');
};
main();
