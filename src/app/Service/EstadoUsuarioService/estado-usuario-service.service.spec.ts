import { TestBed } from '@angular/core/testing';

import { EstadoUsuarioServiceService } from './estado-usuario-service.service';

describe('EstadoUsuarioServiceService', () => {
  let service: EstadoUsuarioServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadoUsuarioServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
