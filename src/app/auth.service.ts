import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  login(nombreUsuario: string, contrasena: string): Observable<{ token: string; roles: string[] }> {
    const body = { nombreUsuario, contrasena };
    return this.http.post<{ token: string; roles: string[] }>(this.apiUrl, body).pipe(
      tap(response => {
        const token = response.token;
        if (token && token.includes(".")) { // 🔥 Validar que el token tenga el formato correcto
          console.log("Token recibido correctamente:", token);
          this.guardarToken(token);
          this.guardarRole(token);
        } else {
          console.error("Error: La respuesta del backend no contiene un token válido.", response);
        }
      })
    );
  }

  guardarToken(token: string): void {
    localStorage.setItem('jwtToken', token); // Asegurar que solo se guarda la cadena JWT
  }

  guardarRole(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.roles ? payload.roles[0] : null; // Evitar errores si roles es undefined
      if (role) {
        localStorage.setItem('userRole', role);
      } else {
        console.error("Error: No se encontró el rol dentro del token.");
      }
    } catch (error) {
      console.error("Error al extraer el rol del token:", error);
    }
  }

  obtenerToken(): string | null {
    const token = localStorage.getItem('jwtToken');
    if (!token || !token.includes(".")) {
      console.error("Error: El token en localStorage no es válido.");
      return null;
    }
    return token;
  }

  obtenerRole(): string | null {
    return localStorage.getItem('userRole');
  }

  cerrarSesion(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}