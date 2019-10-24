import { Injectable, ErrorHandler } from '@angular/core';
import { MdcSnackbar } from '@angular-mdc/web';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SnackbarErrorService extends ErrorHandler {

  constructor(private snackbar: MdcSnackbar) {
    super();
  }

  handleError(error) {
    if (environment.showErrors) {
      this.snackbar.open(error, 'Close');
    }
    console.error(error);
  }
}
