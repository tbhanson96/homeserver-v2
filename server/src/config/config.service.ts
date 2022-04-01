import { Injectable, Inject, Logger } from "@nestjs/common";
import path from 'path';
import { ConfigMissingException } from '../lib/exceptions';
import Config from './config.default.json';
import { randomBytes } from 'crypto';
import jsonfile from 'jsonfile';
import { fs } from "memfs";
import flat from 'flat';

@Injectable()
export class ConfigService {
    public config = Config;
    private readonly DELIMITER = '_';
    constructor(
        private readonly log?: Logger,
    ) {
        process.env['APP_app_configOverridePath']='jslkdjfkla';
        let configFlat = this.replaceValuesWithWildcard(flat.flatten<any, any>(Config, { delimiter: this.DELIMITER }), __dirname);
        this.config = flat.unflatten<any, any>(configFlat, { delimiter: this.DELIMITER });
        const envConfigFlat = ConfigService.mapEnvToObject();
        const envConfig = flat.unflatten<any, any>(envConfigFlat, { delimiter: this.DELIMITER });
        this.config.app.configOverridePath = envConfig.app?.configOverridePath || this.config.app.configOverridePath;

        this.loadConfig(this.config.app.configOverridePath);
        configFlat = flat.flatten<any, any>(this.config, { delimiter: this.DELIMITER });
        const resultFlat = {
            ...configFlat,
            ...envConfigFlat,
        };

        this.config = flat.unflatten<any, any>(resultFlat, { delimiter: this.DELIMITER });
        this.config.auth.jwtSecret = randomBytes(20).toString();
    } 

    // loads config file, returns whether or not load was successful
    public loadConfig(filePath: string): boolean {
        let configOverrideFlat = {};
        try {
            configOverrideFlat = flat.flatten<any, any>(jsonfile.readFileSync(filePath), { delimiter: this.DELIMITER });
        } catch (e) {
            this.log?.warn(`Could not read config file ${filePath} does not exist, using defaults`);
            return false;
        }
        
        const curConfigFlat = flat.flatten<any, any>(this.config, { delimiter: this.DELIMITER });
        let resultFlat = {
            ...curConfigFlat,
            ...configOverrideFlat,
        }
        resultFlat = this.replaceValuesWithWildcard(resultFlat, path.dirname(filePath));

        this.config = flat.unflatten<any, any>(resultFlat, { delimiter: this.DELIMITER });
        return true;
    }

    public saveConfig(): void {
        jsonfile.writeFileSync(
            this.config.app.configOverridePath,
            this.config,
            {
                spaces: 2,
                EOL: '\n',
            }
            );
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
