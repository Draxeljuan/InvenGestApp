import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth/login';

  constructor(private http: HttpClient, private router: Router) { }

  login(nombreUsuario: string, contrasena: string): Observable<{ token: string; roles: string[] }> {
    const body = { nombreUsuario, contrasena };
    return this.http.post<{ token: string; roles: string[] }>(this.apiUrl, body).pipe(
      timeout(7000),  // Aplicamos timeout antes de manejar errores
      tap(response => {
        const token = response.token;
        if (token && token.includes(".")) {
          console.log(" Token recibido correctamente:", token);
          this.guardarToken(token);
          this.guardarRole(token);
        } else {
          console.error(" Error: La respuesta del backend no contiene un token válido.", response);
        }
      }),
      catchError(err => {
        console.error(" Error en autenticación:", err);

        if (err.name === 'TimeoutError') {
          // Detectamos timeout como un error independiente
          setTimeout(() => {
            alert("⏳ La autenticación está tardando más de lo esperado...");
          }, 5000);

          setTimeout(() => {
            alert("⚠ Error : La base de datos no respondió. Recarga la pagina o contacta con un Administrador del Sistema. Código de error: 4081 (DB_TIMEOUT)");
          }, 10000);

          return throwError(() => new Error("Código de error: 4081 (DB_TIMEOUT)"));
        }

        return throwError(() => err);
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