import { TestBed } from '@angular/core/testing';

import { GoogleAuthServiceService } from './google-auth-service.service';

describe('GoogleAuthServiceService', () => {
  let service: GoogleAuthServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleAuthServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
