import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express'
import * as path from 'path';
import { routes, joinRoutes } from '../routes';
import { FileService } from '../services/file.service';
import { ConfigService } from '../services/config.service';

@Injectable()
export class ClientMiddleware implements NestMiddleware {

  constructor(
    private readonly configService: ConfigService,
    private readonly filesService: FileService) { }

  use(req: Request, res: Response, next: Function) {
    const { url } = req;
    if (url.indexOf(routes.api) === 1) {
        // it starts with /api --> continue with execution
        next();
    } else if (url.includes('.')) {
        if (url.includes(routes.files)) {
          const reqFilePath = url.split(routes.files).slice(-1)[0];
          req.url = '/' + joinRoutes(routes.api, routes.files, 'file') + '?file=' + reqFilePath;
          req.query['file'] = reqFilePath;
          next();
        } else {
          // it has a file extension --> resolve the file
          res.sendFile(this.resolvePath(url));
        }
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
