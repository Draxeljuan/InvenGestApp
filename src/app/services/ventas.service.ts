import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = 'http://localhost:8080/ventas'; // URL de ventas
  private facturaUrl = 'http://localhost:8080/facturas'; // URL de facturación
  private clienteUrl = 'http://localhost:8080/clientes'; // URL de clientes
  private productoUrl = 'http://localhost:8080/productos'; // URL de productos

  constructor(private http: HttpClient) { }

  /** Obtener todas las ventas */
  obtenerVentas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  /** Obtener una venta por ID */
  obtenerVenta(idVenta: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${idVenta}`, this.getHeaders());
  }

  /** Crear una nueva venta */
  crearVenta(venta: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, venta, this.getHeaders());
  }

  /** Actualizar una venta existente */
  actualizarVenta(idVenta: number, venta: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idVenta}`, venta, this.getHeaders());
  }

  /** Eliminar una venta */
  eliminarVenta(idVenta: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${idVenta}`, this.getHeaders());
  }

  /** Obtener todos los productos disponibles */
  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`, this.getHeaders());
  }

  /** Buscar productos por nombre o ID */
  buscarProductosPorNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.productoUrl}/buscar?nombre=${nombre}`, this.getHeaders());
  }

  /** Generar factura en PDF */
  generarFactura(idVenta: number): Observable<Blob> {
    return this.http.get(`${this.facturaUrl}/${idVenta}/generar-pdf`, {
      headers: this.getHeaders().headers,
      responseType: 'blob'
    });
  }

  /** Obtener todos los clientes */
  obtenerClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.clienteUrl, this.getHeaders());
  }

  /** Buscar clientes por nombre o apellido */
  buscarClientesPorNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.clienteUrl}?nombre=${nombre}`, this.getHeaders());
  }

  /** Registrar un nuevo cliente */
  registrarCliente(cliente: any): Observable<any> {
    return this.http.post<any>(`${this.clienteUrl}/crear`, cliente, this.getHeaders());
  }

  private getHeaders() {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return { headers };
  }
}