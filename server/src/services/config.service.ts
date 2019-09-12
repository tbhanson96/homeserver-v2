import { Injectable, OnModuleInit, Inject } from "@nestjs/common";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService implements OnModuleInit {
    constructor(@Inject('ROOT_DIR') rootDir: string) { } 

    onModuleInit() {
        
    }
}