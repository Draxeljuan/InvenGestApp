import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovimientoInventarioService {

  private apiUrl = 'http://localhost:8080/movimiento'; // URL de la API

  constructor(private http: HttpClient) { }

  listarMovimientos(): Observable<any[]> {
    const token = localStorage.getItem('jwtToken');

    if (!token || !token.includes('.')) {
      console.error('Error: El token en localStorage no es válido.');
      return throwError(() => new Error('Token inválido'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Usar el token correctamente en el encabezado
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }


}
