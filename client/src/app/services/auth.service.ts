import { Injectable } from '@angular/core';
import { AuthControllerClient, AuthDto } from '@services/api.service';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {
  private isAuthenticated = true;
  constructor(
    private readonly api: AuthControllerClient,
    private readonly router: Router) { }

  getAuthenticated(): Observable<boolean> {
    return Observable.create(observer => {
      this.api.isLoggedIn().subscribe(() => {
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
      this.api.login(AuthDto.fromJS({ username, password })).subscribe(authToken => {
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
