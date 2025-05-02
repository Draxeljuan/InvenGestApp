import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  private apiUrl = 'http://localhost:8080/alerta'; 
  
  constructor(private http: HttpClient) { }

  obtenerAlertas(): Observable<any[]> {
    const token = localStorage.getItem('jwtToken');

    if (!token || !token.includes(".")) {
      console.error("Error: El token en localStorage no es válido.");
      return throwError(() => new Error("Usuario no autenticado"));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

}
