import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express'
import * as path from 'path';
import { routes, joinRoutes } from '../routes';
import { FileService } from '../files/file.service';
import { ConfigService } from '../services/config.service';
import * as proxy from 'http-proxy-middleware';

@Injectable()
export class ClientMiddleware implements NestMiddleware {

  constructor(
    private readonly configService: ConfigService) { }

  use(req: Request, res: Response, next: Function) {
    const { url } = req;
    if (url.indexOf(routes.api) === 1) {
        // it starts with /api --> continue with execution
        next();
    } else if (url.includes('.')) {
      // it has a file extension --> resolve the file
      res.sendFile(this.resolvePath(url));
    } else {
        // in all other cases, redirect to the index.html
        res.sendFile(this.resolvePath('index.html'));
    }
  }

  private resolvePath(file: string): string {
    let res = path.join(this.configService.env.CLIENT_DIR, file);
    return res;
  }
}
