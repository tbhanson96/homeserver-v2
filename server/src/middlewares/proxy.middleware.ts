import { Injectable, NestMiddleware, OnModuleInit } from '@nestjs/common';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { ConfigService } from '../config/config.service';
import { routes } from '../routes';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {

  private proxy: RequestHandler;
  constructor(
      private readonly configService: ConfigService
    ) {
    
    this.proxy = createProxyMiddleware({
        target: this.configService.config.ebooks.libGen.url,
        pathRewrite: { '/proxy': ''},
        followRedirects: true,
        changeOrigin: true,
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { url } = req;
    if (url.indexOf(routes.api) === 1) {
        next();
    } else if (url.indexOf(routes.proxy) === 1) {
        req.headers.referer = '';
        this.proxy(req, res, next);
    } else {
        next();
    }
  }
}