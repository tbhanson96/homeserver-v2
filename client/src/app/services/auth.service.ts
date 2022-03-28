import { Injectable } from '@angular/core';
import { ApiService } from '@api/services';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {
  private isAuthenticated = true;
  constructor(
    private readonly api: ApiService,
    private readonly router: Router) { }
 
  // async init() {
  //   return new Promise(res => {
  //     this.getAuthenticated().subscribe(authed => {
  //       this.isAuthenticated = authed;
  //       res();
  //     });
  //   });
  // }

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

  canActivate(): boolean {
    if (!this.isAuthenticated) {
      this.router.navigateByUrl('/login')
      return false;
    }
    return true;
  }

}
