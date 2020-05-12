import { Injectable, Inject } from "@nestjs/common";
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ConfigMissingException } from '../lib/exceptions';
import { randomBytes } from 'crypto';

@Injectable()
export class ConfigService {
    private readonly rootWildcard = '{.}';
    private readonly envFilePath: string;
    private readonly _env: any;
    constructor(envFilePath: string) {
        this.envFilePath = envFilePath;
        dotenv.config({ path: this.envFilePath }); 
        for (let e of Object.keys(process.env)) {
            let val = process.env[e];
            if (val && val.includes(this.rootWildcard)) {
                process.env[e] = val.replace(this.rootWildcard, path.dirname(this.envFilePath));
            }
        }
        this._env = this.throwOnUndefined(process.env);
        this.set('JWT_SECRET', randomBytes(20).toString())
    } 

    get env(): any {
        return this._env;
    }

    public set(key: string, value: string) {
        this._env[key] = value;
    }
    
    private throwOnUndefined(obj: any): string {
        const handler = {
            get(env: any, config: any) {
                if (env[config]) {
                    return env[config];
                } else {
                    throw new ConfigMissingException(config);
                }
            }
        };
    
        return new Proxy(obj, handler);
    }
}

export class EnvOptions {
    public PORT: string;
    public FILE_UPLOAD_DEST: string;
    public CLIENT_DIR: string;
    public USE_HTTPS: string;
    public SSL_FILEPATH: string;
    public FILES_DIR: string; 
}