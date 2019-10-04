import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response } from 'express'
import * as path from 'path';
import { routes } from '../routes';
import { FileService } from '../services/file.service';

@Injectable()
export class ClientMiddleware implements NestMiddleware {

  constructor(
    @Inject('APP_ROOT') private appRoot: string,
    private readonly filesService: FileService) { }

  use(req: Request, res: Response, next: Function) {
    const { url } = req;
    if (url.indexOf(routes.api) === 1) {
        // it starts with /api --> continue with execution
        next();
    } else if (url.includes('.')) {
        if (url.includes(routes.files)) {
          const reqPath = url.split(routes.files).slice(-1)[0];
          const localPath = this.filesService.getLocalFilePath(reqPath);
          res.sendFile(localPath);
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
    let res = path.join(this.appRoot, 'client', 'dist', file);
    return res;
  }
}
