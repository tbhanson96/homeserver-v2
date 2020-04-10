import { TestBed } from '@angular/core/testing';

import { EbooksService } from './ebooks.service';

describe('EbooksService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EbooksService = TestBed.get(EbooksService);
    expect(service).toBeTruthy();
  });
});
