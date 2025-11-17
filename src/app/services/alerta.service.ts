import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private apiUrl = 'http://localhost:8080/alerta';

  constructor(private http: HttpClient) { }

  // Obtener alertas activas después de que el backend las haya limpiado
  obtenerAlertas(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      tap(alertas => console.log("Alertas activas obtenidas:", alertas)),
      catchError(error => {
        console.error("Error al obtener alertas:", error);
        return throwError(() => new Error("No se pudo obtener las alertas"));
      })
    );
  }

  // Obtener alertas con productos asociados
  obtenerAlertasConProducto(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/con-producto`, { headers: this.getHeaders() });
  }

  // Llamar al backend para limpiar alertas innecesarias
  limpiarAlertas(): Observable<void> {
    console.log(" Ejecutando limpieza de alertas en el backend...");
    return this.http.delete<void>(`${this.apiUrl}/limpiar`, { headers: this.getHeaders() }).pipe(
      tap(() => console.log(" Limpieza de alertas completada!")),
      catchError(error => {
        console.error(" Error en la limpieza de alertas:", error);
        return throwError(() => new Error("No se pudo limpiar las alertas"));
      })
    );
  }

  // Eliminar una alerta manualmente si es necesario
  eliminarAlerta(id: number): Observable<void> {
    console.log(`🔄 Enviando solicitud DELETE al backend con ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error(` Error en el DELETE para alerta ID: ${id}`, error);
        return throwError(() => new Error("No se pudo eliminar la alerta"));
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');

    if (!token || !token.includes(".")) {
      console.error("Error: El token en localStorage no es válido.");
      throw new Error("Usuario no autenticado");
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
