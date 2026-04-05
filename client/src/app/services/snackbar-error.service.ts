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
      const message = error instanceof Error ? error.message : String(error);
      this.snackbar.open(message, 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
    console.error(error);
  }
}
