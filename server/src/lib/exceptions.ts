export class ConfigMissingException extends Error {
    constructor(config: string) {
        super(`Config value could not be found in process.env: ${config}`)
    }
}