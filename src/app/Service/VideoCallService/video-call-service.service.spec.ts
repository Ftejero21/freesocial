import { TestBed } from '@angular/core/testing';

import { VideoCallServiceService } from './video-call-service.service';

describe('VideoCallServiceService', () => {
  let service: VideoCallServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoCallServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
