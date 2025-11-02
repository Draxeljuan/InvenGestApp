import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
    return this.http.post<any>(`${this.apiUrl}/crear`, venta, this.getHeaders()).pipe(
      timeout(3000),  // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al registrar venta:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La confirmación de la venta está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error : La base de datos no respondió. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
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
    return this.http.get<any[]>(`${this.productoUrl}/buscar?nombre=${nombre}`, this.getHeaders()).pipe(
      timeout(3000),  // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al buscar productos:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La búsqueda de productos está tardando más de lo esperado...");
          }, 3000);

          setTimeout(() => {
            alert("⚠ Error : La base de datos no respondió. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 7000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }


  /** Generar factura en PDF */
  generarFactura(idVenta: number): Observable<Blob> {
    return this.http.get(`${this.facturaUrl}/${idVenta}/generar-pdf`, {
      headers: this.getHeaders().headers,
      responseType: 'blob'
    }).pipe(
      timeout(3000),  //  Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al generar factura:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La generación de la factura está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error: La base de datos no respondio. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }


  /** Obtener todos los clientes */
  obtenerClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.clienteUrl, this.getHeaders()).pipe(
      timeout(3000),  // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al buscar clientes:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La búsqueda de clientes está tardando más de lo esperado...");
          }, 3000);

          setTimeout(() => {
            alert("⚠ Error: La base de datos no respondio. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 7000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }


  /** Buscar clientes por nombre o apellido */
  buscarClientesPorNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.clienteUrl}?nombre=${nombre}`, this.getHeaders());
  }

  /** Registrar un nuevo cliente */
  registrarCliente(cliente: any): Observable<any> {
    return this.http.post<any>(`${this.clienteUrl}/crear`, cliente, this.getHeaders()).pipe(
      timeout(3000),  // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al registrar cliente:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ El registro del cliente está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error crítico: La base de datos no respondió. Puede estar bloqueada o sobrecargada. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
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