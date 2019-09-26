import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response } from 'express'
import * as path from 'path';
import { routes } from '../routes';

const allowedExt = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];

@Injectable()
export class ClientMiddleware implements NestMiddleware {

  constructor(@Inject('APP_ROOT') private appRoot: string) { }

  use(req: Request, res: Response, next: Function) {
    const { url } = req;
    if (url.indexOf(routes.api) === 1) {
        // it starts with /api --> continue with execution
        next();
    } else if (allowedExt.filter(ext => url.indexOf(ext) > 0).length > 0) {
        // it has a file extension --> resolve the file
        res.sendFile(this.resolvePath(url));
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
