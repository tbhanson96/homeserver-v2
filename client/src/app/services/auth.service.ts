import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '@api/services';
import { AuthDto } from '@api/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {
  private isAuthenticated = true;
  constructor(
    private readonly api: ApiService,
    private readonly router: Router) { }

  getAuthenticated(): Observable<boolean> {
    return Observable.create(observer => {
      this.api.authControllerIsLoggedIn().subscribe(() => {
        observer.next(true);
        observer.complete();
        this.isAuthenticated = true;
      }, () => {
        observer.next(false);
        observer.complete();
        this.isAuthenticated = false;
      });
    });
  }

  login(username: string, password: string): Observable<boolean> {
    return Observable.create(observer => {
      this.api.authControllerLogin({ body: { username, password }}).subscribe(authToken => {
        localStorage.setItem('access_token', authToken); // save incase we want to get later
        observer.next(true);
        observer.complete();
        this.isAuthenticated = true;
      }, err => {
        observer.next(false);
        observer.complete();
        this.isAuthenticated = false;
      });
    });
  }

  canActivate(): boolean {
    if (!this.isAuthenticated) {
      this.router.navigateByUrl('/login');
      return false;
    }
    return true;
  }

}
