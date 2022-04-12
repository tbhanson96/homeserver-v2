import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  public consoleHtml = console;
  username: string;
  password: string;
  constructor(
    private readonly authService: AuthService,
    private readonly snackbar: MatSnackBar,
    private readonly router: Router) { }

  ngOnInit() {
    const video: any = document.getElementById('video');
    video.oncanplaythrough = function() {
      video.muted = true,
      video.play();
    }
  }

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(authed => {
      if (authed) {
        const redirect = localStorage.getItem('redirect_url');
        if (redirect) {
          localStorage.removeItem('redirect_url');
          this.router.navigateByUrl(redirect);
        } else {
          this.router.navigateByUrl('/home');
        }
      } else {
        this.snackbar.open('Failed to login: invalid username and password.');
      }
    });
  }

}
