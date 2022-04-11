import { Injectable } from '@angular/core';
import { ApiService } from '@api/services';
import { CanActivate, Router } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {
  private isAuthenticated = false;
  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) { }

  getAuthenticated(): Observable<boolean> {
    return new Observable(observer => {
      this.api.authControllerIsLoggedIn().subscribe({
        next: () => {
        observer.next(true);
        observer.complete();
        this.isAuthenticated = true;
        },
        error: () => {
          observer.next(false);
          observer.complete();
          this.isAuthenticated = false;
        }
      });
    });
  }

  login(username: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      this.api.authControllerLogin({ body: { username, password }}).subscribe({
        next: auth_token => {
          localStorage.setItem('access_token', auth_token); // save incase we want to get later
          observer.next(true);
          observer.complete();
          this.isAuthenticated = true;
        },
        error:  err => {
          observer.next(false);
          observer.complete();
          this.isAuthenticated = false;
        }
      });
    })
  }

  async canActivate(): Promise<boolean> {
    if (this.isAuthenticated) {
      return true;
    }
    const authed = await lastValueFrom(this.getAuthenticated());
    if (authed) {
      return true;
    }
    localStorage.setItem('redirect_url', window.location.pathname);
    this.router.navigateByUrl('/login')
    return false;
  }

}
