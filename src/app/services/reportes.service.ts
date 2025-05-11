import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = 'http://localhost:8080/reportes'; // URL de reportes
  private apiReporteVentas = 'http://localhost:8080/reportes/venta'; // URL de reportes de ventas
  private apiReporteInventario = 'http://localhost:8080/reportes/inventario'; // URL de reportes de inventario

  constructor(private http: HttpClient) { }

  obtenerReportes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, this.getHeaders()); 
  }

  obtenerReporte(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders()); 
  }

  eliminarReporte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders()); 
  }

  generarReporte(tipo: string, fechaInicio: string, fechaFin: string, idUsuario: number): Observable<void> {
    const url = tipo === "ventas"
      ? `${this.apiReporteVentas}/generar-pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&minVentas=10&idUsuario=${idUsuario}`
      : `${this.apiReporteInventario}/generar-pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&idUsuario=${idUsuario}`;

    return this.http.get<void>(url, this.getHeaders());
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
