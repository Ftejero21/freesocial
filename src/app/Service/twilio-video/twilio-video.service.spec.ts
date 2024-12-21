import { TestBed } from '@angular/core/testing';

import { TwilioVideoService } from './twilio-video.service';

describe('TwilioVideoService', () => {
  let service: TwilioVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TwilioVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
