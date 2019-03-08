import { TestBed } from '@angular/core/testing';

import { OMDbProviderService } from './omdb-provider.service';

describe('OMDbProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OMDbProviderService = TestBed.get(OMDbProviderService);
    expect(service).toBeTruthy();
  });
});
