
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express'
import { routes, joinRoutes } from '../routes';
import { FileService } from '../files/file.service';

@Injectable()
export class FilesMiddleware implements NestMiddleware {

  constructor(private readonly filesService: FileService) { }

  use(req: Request, res: Response, next: Function) {
    const { url } = req;
    if (url.indexOf(routes.api) === 1) {
        // it starts with /api --> continue with execution
        next();
        return;
    } else if (url.includes(routes.files + '/') && url.includes('.')) {
        const reqFilePath = url.split(routes.files).slice(-1)[0];
        req.url = '/' + joinRoutes(routes.api, routes.files, 'file') + '?file=' + reqFilePath;
        req.query['file'] = reqFilePath;
    }
    next();
  }
}
