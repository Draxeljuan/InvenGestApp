import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = 'http://localhost:8080/productos'; // URL de la API
  
  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<any[]> {
    const token = localStorage.getItem('jwtToken'); // Obtener el token correctamente
    
    if (!token || !token.includes(".")) {
      console.error("Error: El token en localStorage no es válido.");
      return throwError(() => new Error("Usuario no autenticado"));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Usar el token correctamente en el encabezado
    });

    console.log("Enviando Token:", token); // Verificar el token enviado
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

}
