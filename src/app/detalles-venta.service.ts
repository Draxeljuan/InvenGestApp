import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DetallesVentaService {

  private detalles: any[] = [
    { idProducto: 'P001', idVenta: 'S001', cantidad: 2, precioUnitario: 29.99, subtotal: 59.98 },
    { idProducto: 'P002', idVenta: 'S001', cantidad: 1, precioUnitario: 49.99, subtotal: 49.99 },
    { idProducto: 'P003', idVenta: 'S002', cantidad: 3, precioUnitario: 19.99, subtotal: 59.97 },
    { idProducto: 'P004', idVenta: 'S003', cantidad: 1, precioUnitario: 54.50, subtotal: 54.50 }
  ];

  constructor() {}

  // Método para obtener los detalles de una venta específica
  getDetallesPorVenta(idVenta: string): any[] {
    return this.detalles.filter(detalle => detalle.idVenta === idVenta);
  }

}
