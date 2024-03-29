import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express'
import * as path from 'path';
import { routes, joinRoutes } from '../routes';
import { ConfigService } from '../config/config.service';

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
    let res = path.join(this.configService.config.app.clientDir, file);
    return res;
  }
}
