import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express'
import { routes } from '../routes';
import { ConfigService } from '../config/config.service';
import path from 'path';

@Injectable()
export class EbooksMiddleware implements NestMiddleware {

  constructor(private readonly configService: ConfigService) { }

  use(req: Request, res: Response, next: Function) {
    const requestPath = req.path;
    if (requestPath.indexOf(routes.api) === 1) {
        // it starts with /api --> continue with execution
        next();
        return;
    } else if (requestPath.includes(routes.newspapers + '/') && requestPath.includes('.')) {
        const reqFilePath = decodeURI(requestPath.split(routes.newspapers).slice(-1)[0]);
        res.sendFile(path.join(this.configService.config.newspapers.homeDir, reqFilePath));
    } else if (requestPath.includes(routes.ebooks + '/') && requestPath.includes('.')) {
        const reqFilePath = decodeURI(requestPath.split(routes.ebooks).slice(-1)[0]);
        res.sendFile(path.join(this.configService.config.ebooks.homeDir, reqFilePath));
    } else {
        next();
    }
  }
}
