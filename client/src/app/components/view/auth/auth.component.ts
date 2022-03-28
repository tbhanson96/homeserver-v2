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
  }

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(authed => {
      if (authed) {
        this.router.navigateByUrl('/home');
      } else {
        this.snackbar.open('Failed to login: invalid username and password.');
      }
    });
  }

}
