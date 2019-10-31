export class ConfigMissingException extends Error {
    constructor(config: string) {
        super(`Config value could not be found in process.env: ${config}`)
    }
}

export class ConfigInvalidException extends Error {
    constructor(key: string, val: string) {
        super(`Config entry was invalid for ${key}: ${val}`);
    }
}