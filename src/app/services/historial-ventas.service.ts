import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class HistorialVentasService {

  private apiUrl = 'http://localhost:8080/ventas'; // URL de la API

  constructor(private http: HttpClient) { }

  listarVentas(): Observable<any[]> {
    const token = localStorage.getItem("jwtToken");

    if (!token || !token.includes(".")) {
      console.error("❌ Error: El token en localStorage no es válido.");
      return throwError(() => new Error("Token inválido"));
    }

    const headers = new HttpHeaders({
      "Authorization": `Bearer ${token}` // Usar el token correctamente en el encabezado
    });

    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      timeout(3000),  // Si la respuesta no llega en 7s, se lanza error
      catchError(err => {
        console.error(" Error al obtener ventas:", err);

        if (err.name === "TimeoutError") {
          setTimeout(() => {
            alert("⏳ La carga de ventas está tardando más de lo esperado...");
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


  obtenerVenta(idVenta: number): Observable<any> {
    const token = localStorage.getItem('jwtToken');

    if (!token || !token.includes('.')) {
      console.error('Error: El token en localStorage no es válido.');
      return throwError(() => new Error('Token inválido'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Usar el token correctamente en el encabezado
    });

    return this.http.get<any>(`${this.apiUrl}/${idVenta}`, { headers });
  }

}
