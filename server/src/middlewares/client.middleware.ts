import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express'
import * as path from 'path';
import { routes, joinRoutes } from '../routes';
import { ConfigService } from '../services/config.service';

@Injectable()
export class ClientMiddleware implements NestMiddleware {

  constructor(
    private readonly configService: ConfigService) { }

  use(req: Request, res: Response, next: Function) {
    const { url } = req;
    // filter out all requests for proxy middlware
    if (url.includes('/apps')) {
      next();
    } 
    // modify request urls coming from proxy client pages
    else if(req.headers.referer && req.headers.referer.includes('/apps') && req.headers.host) {
      const origPath = req.headers.referer.split(req.headers.host)[1];
      const newUrl = `${origPath}${req.path}`;
      res.redirect(newUrl);
    } else if (url.indexOf(routes.api) === 1) {
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
