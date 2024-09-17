import { Injectable, Inject, Logger } from "@nestjs/common";
import path from 'path';
import { ConfigMissingException } from '../lib/exceptions';
import Config from './config.json';
import { randomBytes } from 'crypto';
import { writeFileSync, readFileSync } from 'jsonfile';
import { flatten, unflatten } from 'flat';

@Injectable()
export class ConfigService {
    public config = Config;
    private readonly DELIMITER = '_';
    constructor(
        private readonly log?: Logger,
    ) {
        let configFlat = this.replaceValuesWithWildcard(flatten<any, any>(Config, { delimiter: this.DELIMITER }), __dirname);
        this.config = unflatten<any, any>(configFlat, { delimiter: this.DELIMITER });
        const envConfigFlat = ConfigService.mapEnvToObject();
        const envConfig = unflatten<any, any>(envConfigFlat, { delimiter: this.DELIMITER });
        this.config.app.configOverridePath = envConfig.app?.configOverridePath || this.config.app.configOverridePath;

        this.loadConfig(this.config.app.configOverridePath);
        configFlat = flatten<any, any>(this.config, { delimiter: this.DELIMITER });
        const resultFlat = {
            ...configFlat,
            ...envConfigFlat,
        };

        this.config = unflatten<any, any>(resultFlat, { delimiter: this.DELIMITER });
        this.config.auth.jwtSecret = randomBytes(20).toString();
        this.log?.log(`Succesfully loaded config: ${JSON.stringify(this.config)}`);
    } 

    // loads config file, returns whether or not load was successful
    public loadConfig(filePath: string): boolean {
        let configOverrideFlat = {};
        try {
            configOverrideFlat = flatten<any, any>(readFileSync(filePath), { delimiter: this.DELIMITER });
        } catch (e) {
            this.log?.warn(`Could not read config file ${filePath} does not exist, using defaults`);
            return false;
        }
        
        const curConfigFlat = flatten<any, any>(this.config, { delimiter: this.DELIMITER });
        let resultFlat = {
            ...curConfigFlat,
            ...configOverrideFlat,
        }
        resultFlat = this.replaceValuesWithWildcard(resultFlat, path.resolve(path.dirname(filePath)));

        this.config = unflatten<any, any>(resultFlat, { delimiter: this.DELIMITER });
        this.log?.log(`Successfully loaded config from file: ${filePath}`);
        return true;
    }

    public saveConfig(): void {
        writeFileSync(
            this.config.app.configOverridePath,
            this.config,
            {
                spaces: 2,
                EOL: '\n',
            }
        );
        this.log?.log(`Successfully wrote config to ${this.config.app.configOverridePath}`);
    }

    private static mapEnvToObject(): any {
        const appVars = Object.keys(process.env)
            .filter(key => key.startsWith(Config.app.envPrefix))
            .reduce((obj: any, key) => {
                obj[key.replace(Config.app.envPrefix, '')] = process.env[key];
                return obj;
            }, {});
        return appVars;
    }

    private replaceValuesWithWildcard(flatConfig: any, directory: string): any {
        return Object.keys(flatConfig).reduce((obj: any, key) => {
            if (typeof(flatConfig[key]) === 'string') {
                obj[key] = (<string>flatConfig[key])
                    .replace(Config.app.rootWildCard, directory); 
            } else {
                obj[key] = flatConfig[key];
            }
            return obj;
        }, {});
    }

    // private throwOnUndefined(obj: any): string {
    //     const handler = {
    //         get(env: any, config: any) {
    //             if (env[config]) {
    //                 return env[config];
    //             } else {
    //                 throw new ConfigMissingException(config);
    //             }
    //         }
    //     };
    
    //     return new Proxy(obj, handler);
    // }
}
