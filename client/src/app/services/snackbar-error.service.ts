import { Injectable, ErrorHandler } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarErrorService extends ErrorHandler {

  constructor(private snackbar: MatSnackBar) {
    super();
  }

  handleError(error) {
    if (environment.showErrors) {
      this.snackbar.open(error, 'Close', {
        duration: 2000,
      });
    }
    console.error(error);
  }
}
