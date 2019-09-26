import { Injectable, Inject } from "@nestjs/common";
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ConfigMissingException } from '../lib/exceptions';

@Injectable()
export class ConfigService {

    constructor(@Inject('APP_ROOT') private appRoot: string) {
        dotenv.config({path: path.join(this.appRoot, 'default.env')}); 
        process.env.ROOT_DIR = process.env.ROOT_DIR || path.join(this.appRoot, 'mock')
    } 

    get env(): any {
        return this.throwOnUndefined(process.env)
    }
    
    private throwOnUndefined(obj: any) {
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