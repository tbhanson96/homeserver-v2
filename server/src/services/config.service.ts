import { Injectable, Inject } from "@nestjs/common";
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ConfigMissingException } from '../lib/exceptions';

@Injectable()
export class ConfigService {
    private readonly rootWildcard = '{.}';
    private readonly envFilePath: string;
    constructor(envFilePath: string) {
        this.envFilePath = envFilePath;
        dotenv.config({ path: path.join(this.envFilePath, 'default.env') }); 
        for (let e of Object.keys(process.env)) {
            let val = process.env[e];
            if (val && val.includes(this.rootWildcard)) {
                process.env[e] = val.replace(this.rootWildcard, this.envFilePath);
            }
        }
    } 

    get env(): any {
        return this.throwOnUndefined(process.env)
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