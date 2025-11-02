import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = 'http://localhost:8080/reportes'; // URL de reportes
  private apiReporteVentas = 'http://localhost:8080/reportes/venta'; // URL de reportes de ventas
  private apiReporteInventario = 'http://localhost:8080/reportes/inventario'; // URL de reportes de inventario

  constructor(private http: HttpClient) { }

  obtenerReportes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, this.getHeaders()).pipe(
      timeout(3000),  //  Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al obtener reportes:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La carga de reportes está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error: La base de datos no respondió. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }


  obtenerReporte(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  eliminarReporte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
      timeout(3000),  // Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error(" Error al eliminar reporte:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La eliminación del reporte está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error: La base de datos no respondió. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => new Error(`Código de error: ${err.status || "Desconocido"}`));
      })
    );
  }

  generarReporte(tipo: string, fechaInicio: string, fechaFin: string, idUsuario: number): Observable<void> {
    const url = tipo === "ventas"
      ? `${this.apiReporteVentas}/generar-pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&minVentas=10&idUsuario=${idUsuario}`
      : `${this.apiReporteInventario}/generar-pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&idUsuario=${idUsuario}`;

    return this.http.get<void>(url, this.getHeaders()).pipe(
      timeout(3000),  //  Si la respuesta no llega en 3s, se lanza error
      catchError(err => {
        console.error("❌ Error al generar reporte:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La generación del reporte está tardando más de lo esperado...");
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



  private getHeaders() {
    const token = localStorage.getItem('jwtToken'); // Obtiene el token almacenado
    if (!token) {
      console.error("⚠ No se encontró el token de autenticación.");
      return {}; // Retorna headers vacíos si no hay token
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return { headers };
  }

}
