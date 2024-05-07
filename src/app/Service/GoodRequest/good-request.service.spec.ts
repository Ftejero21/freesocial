import { TestBed } from '@angular/core/testing';

import { GoodRequestService } from './good-request.service';

describe('GoodRequestService', () => {
  let service: GoodRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoodRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
