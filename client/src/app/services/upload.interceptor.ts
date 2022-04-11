import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UploadInterceptor implements HttpInterceptor {

    public readonly progress: Subject<HttpEvent<any>>;
    constructor(
    ) {
        this.progress = new Subject();
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.includes('/api/files')) {
            req = req.clone({ reportProgress: true });
        }
        return next.handle(req).pipe(tap(event => {
            this.progress.next(event);
        }));
    }
}