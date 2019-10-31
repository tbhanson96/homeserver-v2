import { Injectable, NestMiddleware, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../services/config.service';
import * as proxy from 'http-proxy-middleware'
import { ConfigInvalidException } from '../lib/exceptions';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { appConstants } from '../constants';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {

  proxies: { [key: string]: proxy.Proxy } = {};
  constructor(private readonly configService: ConfigService) {
    let proxiesValue: string;
    try {
        proxiesValue = this.configService.env.PROXIES;
    } catch {
        return;
    }
    const list = proxiesValue.split(';');
    list.forEach(entry => {
        const info = entry.split('=');
        if (info.length != 2 || !info[1]) {
            throw new ConfigInvalidException('PROXIES', proxiesValue);
        }
        let pathRewrite: any = {};
        pathRewrite[`^${appConstants.proxyRoute}${info[0]}`] = '';
        this.proxies[info[0]] = proxy.default({ target: info[1], pathRewrite, logLevel: 'warn'});
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const route = req.path;
    let found = false;
    Object.keys(this.proxies).forEach(p => {
      if (route.includes(p) && !found) {
        res.header('X-Forwarded-Host', p);
        this.proxies[p](req, res, next);
        found = true;
      }
    });
    if (!found) {
      next();
    }
  }
}
