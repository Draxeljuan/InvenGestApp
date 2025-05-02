import { TestBed } from '@angular/core/testing';

import { HistorialVentasService } from './historial-ventas.service';

describe('HistorialVentasService', () => {
  let service: HistorialVentasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistorialVentasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
