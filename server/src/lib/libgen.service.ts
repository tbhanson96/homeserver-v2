import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from 'config/config.service';
import libgen from 'libgen';

@Injectable()
export class LibgenService implements OnModuleInit {
    constructor(
        private readonly config: ConfigService,
        private readonly log: Logger,
    ) { }

    
}
