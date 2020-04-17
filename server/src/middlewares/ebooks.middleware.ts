import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express'
import { routes } from '../routes';
import { ConfigService } from '../services/config.service';
import path from 'path';

@Injectable()
export class EbooksMiddleware implements NestMiddleware {

  constructor(private readonly configService: ConfigService) { }

  use(req: Request, res: Response, next: Function) {
    const { url } = req;
    if (url.indexOf(routes.api) === 1) {
        // it starts with /api --> continue with execution
        next();
        return;
    } else if (url.includes(routes.ebooks + '/') && url.includes('.')) {
        const reqFilePath = decodeURI(url.split(routes.ebooks).slice(-1)[0]);
        res.sendFile(path.join(this.configService.env.EBOOK_DIR, reqFilePath));
    } else {
        next();
    }
  }
}
