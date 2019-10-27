import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest <any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

        // const idToken = localStorage.getItem(environment.jwtKeyName);

        // if (idToken) {
        //     const cloned = req.clone({
        //         headers: req.headers.set("Authorization",
        //             "Bearer " + idToken)
        //     });

        //     return next.handle(cloned);
        // }
        // else {
            return next.handle(req);
        // }
    }
}