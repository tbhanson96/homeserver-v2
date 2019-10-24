import { TestBed } from '@angular/core/testing';

import { SnackbarErrorService } from './snackbar-error.service';

describe('SnackbarErrorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SnackbarErrorService = TestBed.get(SnackbarErrorService);
    expect(service).toBeTruthy();
  });
});
