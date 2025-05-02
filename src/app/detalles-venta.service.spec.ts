import { TestBed } from '@angular/core/testing';

import { DetallesVentaService } from './detalles-venta.service';

describe('DetallesVentaService', () => {
  let service: DetallesVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetallesVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
