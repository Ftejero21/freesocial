import { TestBed } from '@angular/core/testing';

import { ActualizarService } from './actualizar.service';

describe('ActualizarService', () => {
  let service: ActualizarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActualizarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
