import { Injectable, NestMiddleware } from '@nestjs/common';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { ConfigService } from '../config/config.service';
import { routes } from '../routes';

const LIBGEN_PROXY_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {

  private proxy: RequestHandler;
  constructor(
      private readonly configService: ConfigService
    ) {
    const libgenBaseUrl = this.configService.config.ebooks.libGen.url.replace(/\/$/, '');

    this.proxy = createProxyMiddleware({
        target: libgenBaseUrl,
        pathRewrite: { '^/proxy': ''},
        followRedirects: true,
        changeOrigin: true,
        headers: {
          referer: `${libgenBaseUrl}/`,
          origin: libgenBaseUrl,
          'user-agent': LIBGEN_PROXY_USER_AGENT,
        },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { url } = req;
    if (url.indexOf(routes.api) === 1) {
        next();
    } else if (url.indexOf(routes.proxy) === 1) {
        this.proxy(req, res, next);
    } else {
        next();
    }
  }
}
