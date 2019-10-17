import { Injectable, ErrorHandler } from '@angular/core';
import { MdcSnackbar } from '@angular-mdc/web';

@Injectable({
  providedIn: 'root'
})
export class SnackbarErrorService extends ErrorHandler {

  constructor(private snackbar: MdcSnackbar) {
    super();
  }

  handleError(error) {
    this.snackbar.open(error, 'Close');
  }
}
